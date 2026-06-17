import { showToast } from '../utils/ui.js';
/**
 * @module challenges
 * @description Eco-Challenges & Gamification component for EcoTrack
 */

export function renderChallenges(container) {
  // Clear container
  container.innerHTML = '';
  
  const content = document.createElement('div');
  content.className = 'challenges-page';

  // Mock User Stats
  const userStats = {
    totalPoints: 1250,
    currentStreak: 5,
    challengesCompleted: 8,
    co2Saved: '145 kg'
  };

  // Weekly Challenge
  const weeklyChallenge = {
    id: 'weekly-1',
    title: 'Meatless Week',
    description: 'Go an entire 7 days without consuming any meat products. Replace them with plant-based alternatives.',
    progress: 4, // days completed
    totalDays: 7,
    points: 500,
    isActive: true
  };

  // Available Challenges
  const availableChallenges = [
    { id: 'c1', title: 'Public Transport Hero', desc: 'Use only public transport for a week', points: 300, icon: '🚌' },
    { id: 'c2', title: 'Energy Saver', desc: 'Reduce electricity usage by 20% this month', points: 400, icon: '💡' },
    { id: 'c3', title: 'Zero Waste Day', desc: 'Produce absolutely no trash for 24 hours', points: 150, icon: '♻️' },
    { id: 'c4', title: 'Walk 10K Steps', desc: 'Walk instead of driving for short trips', points: 100, icon: '👟' },
    { id: 'c5', title: 'Cold Shower Challenge', desc: 'Take only cold showers for 3 days to reduce water heating', points: 200, icon: '🚿' },
    { id: 'c6', title: 'Digital Detox', desc: 'Reduce screen time by 2 hours/day for less energy usage', points: 150, icon: '📱' },
    { id: 'c7', title: 'Local Food Week', desc: 'Eat only locally sourced food for 7 days', points: 350, icon: '🧑‍🌾' }
  ];

  // Badges
  const badges = [
    { id: 'b1', title: 'First Step', desc: 'Complete first challenge', icon: '🌱', unlocked: true },
    { id: 'b2', title: 'Week Warrior', desc: '7-day active streak', icon: '⚔️', unlocked: false },
    { id: 'b3', title: 'Carbon Cutter', desc: 'Save 100kg CO₂', icon: '✂️', unlocked: true },
    { id: 'b4', title: 'Eco Champion', desc: 'Complete 10 challenges', icon: '🏆', unlocked: false },
    { id: 'b5', title: 'Green Legend', desc: 'Complete all main challenges', icon: '👑', unlocked: false }
  ];

  const renderStats = () => `
    <section class="user-stats-bar" aria-label="Your Challenge Stats">
      <div class="stat-item">
        <span class="stat-icon" aria-hidden="true">⭐</span>
        <div class="stat-info">
          <span class="stat-value">${userStats.totalPoints}</span>
          <span class="stat-label">Points</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon" aria-hidden="true">🔥</span>
        <div class="stat-info">
          <span class="stat-value">${userStats.currentStreak} Days</span>
          <span class="stat-label">Current Streak</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon" aria-hidden="true">✅</span>
        <div class="stat-info">
          <span class="stat-value">${userStats.challengesCompleted}</span>
          <span class="stat-label">Completed</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon" aria-hidden="true">☁️</span>
        <div class="stat-info">
          <span class="stat-value">${userStats.co2Saved}</span>
          <span class="stat-label">CO₂ Saved</span>
        </div>
      </div>
    </section>
  `;

  const renderWeeklyChallenge = () => {
    const progressPercent = Math.round((weeklyChallenge.progress / weeklyChallenge.totalDays) * 100);
    return `
      <section class="weekly-challenge-card" aria-labelledby="weekly-title">
        <div class="weekly-header">
          <h2 id="weekly-title">⭐ Featured Weekly Challenge</h2>
          <span class="reward-badge">+${weeklyChallenge.points} pts</span>
        </div>
        <div class="weekly-content">
          <h3>${weeklyChallenge.title}</h3>
          <p>${weeklyChallenge.description}</p>
          
          <div class="progress-container" aria-label="Progress: ${progressPercent}%">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
            </div>
            <div class="progress-labels">
              <span>Day ${weeklyChallenge.progress} of ${weeklyChallenge.totalDays}</span>
              <span>${progressPercent}% Complete</span>
            </div>
          </div>
          
          <div class="weekly-actions">
            <button class="btn-check-in" ${weeklyChallenge.progress >= weeklyChallenge.totalDays ? 'disabled' : ''}>
              Check-in Today
            </button>
            <button class="btn-complete-challenge">Complete Challenge</button>
          </div>
        </div>
      </section>
    `;
  };

  const renderAvailableChallenges = () => {
    const cards = availableChallenges.map(c => `
      <article class="challenge-card">
        <div class="challenge-icon" aria-hidden="true">${c.icon}</div>
        <div class="challenge-details">
          <h3 class="challenge-title">${c.title}</h3>
          <p class="challenge-desc">${c.desc}</p>
          <span class="challenge-points">Reward: ${c.points} pts</span>
        </div>
        <button class="btn-join-challenge" data-id="${c.id}">Join</button>
      </article>
    `).join('');

    return `
      <section class="available-challenges" aria-labelledby="available-title">
        <h2 id="available-title">Available Challenges</h2>
        <div class="challenges-grid">
          ${cards}
        </div>
      </section>
    `;
  };

  const renderBadges = () => {
    const badgeCards = badges.map(b => `
      <div class="badge-item ${b.unlocked ? 'unlocked' : 'locked'}" aria-label="${b.title}: ${b.desc} (${b.unlocked ? 'Unlocked' : 'Locked'})">
        <div class="badge-icon" aria-hidden="true">${b.icon}</div>
        <div class="badge-info">
          <h4>${b.title}</h4>
          <p>${b.desc}</p>
        </div>
        ${b.unlocked ? '<div class="badge-status-icon" aria-hidden="true">✓</div>' : '<div class="badge-status-icon" aria-hidden="true">🔒</div>'}
      </div>
    `).join('');

    return `
      <section class="achievements-section" aria-labelledby="badges-title">
        <h2 id="badges-title">Your Achievements</h2>
        <div class="badges-grid">
          ${badgeCards}
        </div>
      </section>
    `;
  };

  content.innerHTML = `
    <div class="challenges-header">
      <h1>Eco-Challenges</h1>
      <p>Turn your sustainable actions into habits by participating in our community challenges.</p>
    </div>
    ${renderStats()}
    ${renderWeeklyChallenge()}
    ${renderAvailableChallenges()}
    ${renderBadges()}
    
    <div id="confetti-container" class="confetti-container" aria-hidden="true"></div>
  `;

  // Interaction handlers
  const checkInBtn = content.querySelector('.btn-check-in');
  if (checkInBtn) {
    checkInBtn.addEventListener('click', () => {
      showToast("Checked in successfully! You're doing great.");
      checkInBtn.disabled = true;
      checkInBtn.innerText = "Checked-in!";
    });
  }

  const completeBtn = content.querySelector('.btn-complete-challenge');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      triggerConfetti(content.querySelector('#confetti-container'));
      showToast("Congratulations! You've completed the weekly challenge and earned 500 points!");
    });
  }

  const joinBtns = content.querySelectorAll('.btn-join-challenge');
  joinBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.challenge-card');
      const title = card.querySelector('.challenge-title').innerText;
      e.target.innerText = "Joined ✓";
      e.target.classList.add('joined');
      e.target.disabled = true;
      showToast(`You have joined the "${title}" challenge!`);
    });
  });

  container.appendChild(content);

  // Simple CSS-based confetti effect generator
  function triggerConfetti(containerEl) {
    containerEl.innerHTML = '';
    const colors = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#03A9F4'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      containerEl.appendChild(confetti);
    }

    // Clean up after animation
    setTimeout(() => {
      containerEl.innerHTML = '';
    }, 4000);
  }
}
