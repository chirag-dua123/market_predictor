let predictionChart = null;

document.getElementById('predict-btn').addEventListener('click', () => {
    const ticker = document.getElementById('ticker-input').value.trim();
    if (ticker) {
        fetchPrediction(ticker);
    }
});

document.getElementById('ticker-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const ticker = document.getElementById('ticker-input').value.trim();
        if (ticker) {
            fetchPrediction(ticker);
        }
    }
});

async function fetchPrediction(ticker) {
    // UI state transitions
    document.getElementById('results').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');

    try {
        const response = await fetch(`/api/predict/${ticker}`);
        if (!response.ok) {
            throw new Error('API Request Failed');
        }
        const data = await response.json();
        
        document.getElementById('loading').classList.add('hidden');
        renderResults(data);
    } catch (error) {
        console.error(error);
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('error-message').classList.remove('hidden');
    }
}

function renderResults(data) {
    document.getElementById('results').classList.remove('hidden');
    
    // Process historical data for chart
    const historicalDates = data.historical.map(h => h.date);
    const historicalPrices = data.historical.map(h => h.close);
    
    // Process predictions for chart
    const futureDates = data.projected_dates;
    const futurePrices = data.predictions;
    
    // Update metrics cards
    const lastClose = historicalPrices[historicalPrices.length - 1];
    const finalPrediction = futurePrices[futurePrices.length - 1];
    
    document.getElementById('last-close-val').innerText = `$${lastClose.toFixed(2)}`;
    document.getElementById('pred-val').innerText = `$${finalPrediction.toFixed(2)}`;
    
    // Calculate trend
    const trendDiff = finalPrediction - lastClose;
    const trendPercent = (trendDiff / lastClose) * 100;
    const trendElement = document.getElementById('trend-val');
    
    if (trendDiff >= 0) {
        trendElement.innerText = `+${trendPercent.toFixed(2)}%`;
        trendElement.style.color = 'var(--success)';
    } else {
        trendElement.innerText = `${trendPercent.toFixed(2)}%`;
        trendElement.style.color = 'var(--danger)';
    }

    // Render Chart.js
    renderChart(historicalDates, historicalPrices, futureDates, futurePrices);
    
    // Render News
    renderNews(data.news);
}

function renderNews(news) {
    const feed = document.getElementById('news-feed');
    feed.innerHTML = '';
    
    if (!news || news.length === 0) {
        feed.innerHTML = '<p style="color: var(--text-secondary)">No recent news found for this ticker.</p>';
        return;
    }
    
    news.forEach(article => {
        const item = document.createElement('div');
        item.className = 'news-item';
        
        const date = new Date(article.published_at).toLocaleDateString();
        
        item.innerHTML = `
            <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                <h4>${article.title || 'Market Update'}</h4>
                <p>${article.description || 'Click to read full story...'}</p>
                <div class="news-meta">
                    <span>${article.source || 'MarketAux'}</span> • <span>${date}</span>
                </div>
            </a>
        `;
        feed.appendChild(item);
    });
}

function renderChart(histDates, histPrices, futDates, futPrices) {
    const ctx = document.getElementById('predictionChart').getContext('2d');
    
    // We want the lines to connect seamlessly, so we duplicate the last historical point
    // into the start of the prediction array for drawing purposes.
    const combinedDates = [...histDates, ...futDates];
    
    const histDataFilled = [...histPrices, ...Array(futPrices.length).fill(null)];
    
    const futDataFilled = Array(histPrices.length - 1).fill(null);
    futDataFilled.push(histPrices[histPrices.length - 1]);
    futDataFilled.push(...futPrices);

    if (predictionChart) {
        predictionChart.destroy();
    }

    // Gradient for historical area
    const gradientHist = ctx.createLinearGradient(0, 0, 0, 400);
    gradientHist.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradientHist.addColorStop(1, 'rgba(255, 255, 255, 0)');

    // Gradient for prediction area
    const gradientFut = ctx.createLinearGradient(0, 0, 0, 400);
    gradientFut.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradientFut.addColorStop(1, 'rgba(99, 102, 241, 0)');

    Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
    Chart.defaults.font.family = "'Inter', sans-serif";

    predictionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: combinedDates,
            datasets: [
                {
                    label: 'Historical Close',
                    data: histDataFilled,
                    borderColor: 'rgba(255, 255, 255, 0.9)',
                    backgroundColor: gradientHist,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.2,
                    pointRadius: 0,
                    pointHitRadius: 10
                },
                {
                    label: 'ML Prediction',
                    data: futDataFilled,
                    borderColor: '#6366f1',
                    backgroundColor: gradientFut,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: true,
                    tension: 0.2,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 13 },
                    bodyFont: { size: 14, weight: 'bold' },
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) { label += ': '; }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { maxTicksLimit: 10 }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}
