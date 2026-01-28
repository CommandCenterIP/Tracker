let clickCount = 0;

document.getElementById('changeBtn').addEventListener('click', function() {
    clickCount++;
    const greeting = document.getElementById('greeting');
    const messages = [
        'Hello World!',
        'Welcome!',
        'Nice Click!',
        'Keep Going!',
        'You\'re Amazing!',
        'Great Job!'
    ];
    
    greeting.textContent = messages[clickCount % messages.length];
    document.getElementById('clickCount').textContent = `Clicks: ${clickCount}`;
    
    // Add animation
    greeting.style.animation = 'none';
    setTimeout(() => {
        greeting.style.animation = 'fadeIn 0.6s ease-in';
    }, 10);
});
