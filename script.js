// ─── ⏱️ 裏で動くタイマーを管理する変数（バッティング防止用） ───
let appTimeouts = [];

// 安全にsetTimeoutを呼び出し、管理リストに登録する共通関数
function safeSetTimeout(callback, delay) {
    const id = setTimeout(() => {
        // 実行されたらリストから削除
        appTimeouts = appTimeouts.filter(tId => tId !== id);
        callback();
    }, delay);
    appTimeouts.push(id);
    return id;
}

window.onload = function() {
    // ─── ① 起動時：スプラッシュ画面を6秒表示したあと、ウェルカム画面へ自動遷移 ───
    safeSetTimeout(function() {
        const splash = document.getElementById('splash-screen');
        const welcome = document.getElementById('welcome-screen');
        
        if (splash) {
            splash.style.opacity = '0'; // フェードアウト
            safeSetTimeout(function() { 
                splash.style.display = 'none'; 
                splash.classList.add('hidden');
                
                // ② ウェルカム画面を表示
                if (welcome) {
                    welcome.style.display = 'block';
                    welcome.classList.remove('hidden');
                    safeSetTimeout(() => welcome.classList.add('show'), 10);
                }
            }, 500);
        }
    }, 6000);
};

// ─── ⚙️ デバッグメニュー用の制御関数（全画面共通） ───
function toggleDebugMenu() {
    const overlay = document.getElementById('debug-menu-overlay');
    if (overlay) overlay.classList.toggle('hidden');
}

function clearAllScreens() {
    // 🔥【超重要】裏でカウントダウン中のタイマーをすべて強制停止してバッティングを阻止！
    appTimeouts.forEach(id => clearTimeout(id));
    appTimeouts = []; // リストを空にする

    // すべての画面の状態（クラス・スタイル）を一斉に完全に初期化する
    const screens = ['splash-screen', 'loading-screen', 'welcome-screen', 'category-screen', 'quiz-screen', 'result-screen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
            el.style.opacity = '';
            el.classList.remove('show');
            el.classList.add('hidden');
        }
    });
    const premiumModal = document.getElementById('premium-modal');
    if (premiumModal) premiumModal.classList.add('hidden');
}

function debugJump(target) {
    clearAllScreens();
    toggleDebugMenu(); // メニューを閉じる
    
    if (target === 'splash') {
        const splash = document.getElementById('splash-screen');
        splash.style.display = 'flex';
        splash.classList.remove('hidden');
        safeSetTimeout(() => splash.style.opacity = '1', 10);
    } else if (target === 'welcome') {
        const welcome = document.getElementById('welcome-screen');
        welcome.style.display = 'block';
        welcome.classList.remove('hidden');
        safeSetTimeout(() => welcome.classList.add('show'), 10);
    } else if (target === 'loading') {
        const loading = document.getElementById('loading-screen');
        loading.style.display = 'flex';
        loading.classList.remove('hidden');
        safeSetTimeout(() => loading.style.opacity = '1', 10);
    } else if (target === 'category1') {
        showCategoryScreenDirect();
        const slider = document.querySelector('.category-slider-wrapper');
        if (slider) slider.scrollLeft = 0;
    } else if (target === 'category2') {
        showCategoryScreenDirect();
        const slider = document.querySelector('.category-slider-wrapper');
        if (slider) slider.scrollLeft = slider.clientWidth;
    } else if (target === 'premium') {
        showCategoryScreenDirect();
        const premiumModal = document.getElementById('premium-modal');
        if (premiumModal) premiumModal.classList.remove('hidden');
    }
}

function showCategoryScreenDirect() {
    const catScreen = document.getElementById('category-screen');
    if (catScreen) {
        catScreen.style.display = 'block';
        catScreen.classList.remove('hidden');
        safeSetTimeout(() => catScreen.classList.add('show'), 10);
    }
}

function debugToResult(cat) {
    clearAllScreens();
    toggleDebugMenu();
    selectedCategory = cat;
    
    const resultScreen = document.getElementById('result-screen');
    if (resultScreen) {
        resultScreen.style.display = 'block';
        resultScreen.classList.remove('hidden');
        const resultImg = document.getElementById('result-image');
        if (resultImg) resultImg.src = "images/result_" + cat + ".jpg";
        safeSetTimeout(() => resultScreen.classList.add('show'), 10);
    }
}
// ────────────────────────────────────────

async function switchScreen(hideId, showId) {
    if (hideId) {
        const hideEl = document.getElementById(hideId);
        if (hideEl) {
            hideEl.classList.remove('show');
            await new Promise(r => safeSetTimeout(r, 500));
            hideEl.classList.add('hidden');
            hideEl.style.display = 'none';
        }
    }
    const showEl = document.getElementById(showId);
    if (showEl) {
        showEl.style.display = 'block';
        showEl.classList.remove('hidden');
        await new Promise(r => safeSetTimeout(r, 10));
        showEl.classList.add('show');
    }
}

let selectedCategory = null;
let currentQuestions = [];
let currentIndex = 0;

function showCategories() {
    // ③ ウェルカム画面で「はじめる」を押した時の正規の遷移
    const welcome = document.getElementById('welcome-screen');
    if (welcome) {
        welcome.classList.remove('show');
        welcome.classList.add('hidden');
        welcome.style.display = 'none';
    }
    
    safeSetTimeout(async () => {
        if (welcome) {
            welcome.classList.add('hidden');
            welcome.style.display = 'none';
        }
        
        // ④ 導入画面（loading-screen）を4秒間しっかり表示
        const loading = document.getElementById('loading-screen');
        if (loading) {
            loading.style.display = 'flex';
            loading.classList.remove('hidden');
            safeSetTimeout(() => loading.style.opacity = '1', 10);
        }
        
        await new Promise(r => safeSetTimeout(r, 4000));
        if (loading) loading.style.opacity = '0';
        
        safeSetTimeout(() => {
            if (loading) {
                loading.classList.add('hidden');
                loading.style.display = 'none';
            }
            // ⑤ カテゴリ選択画面を表示
            showCategoryScreenDirect();
        }, 500);
    }, 10);
}

function goWelcome() { switchScreen('category-screen', 'welcome-screen'); }

function startQuiz(cat) {
    selectedCategory = cat;
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        if (card.getAttribute('onclick')?.includes(`'${cat}'`)) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) continueBtn.disabled = false;
}

function proceedToQuiz() {
    if (!selectedCategory) return;

    safeSetTimeout(() => {
        currentQuestions = quizData[selectedCategory];
        currentIndex = 0;
        const catScreen = document.getElementById('category-screen');
        if (catScreen) catScreen.classList.remove('show');
        
        safeSetTimeout(() => {
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => card.classList.remove('selected'));
            const continueBtn = document.getElementById('continue-btn');
            if (continueBtn) continueBtn.disabled = true;

            if (catScreen) {
                catScreen.classList.add('hidden');
                catScreen.style.display = 'none';
            }
            
            const welcomeScreen = document.getElementById('welcome-screen');
            if (welcomeScreen) {
                welcomeScreen.style.display = 'none';
                welcomeScreen.classList.remove('show');
                welcomeScreen.classList.add('hidden');
            }
            
            const quizScreen = document.getElementById('quiz-screen');
            if (quizScreen) {
                quizScreen.style.display = 'block';
                quizScreen.classList.remove('hidden');
            }
            
            const ia = document.getElementById('interactive-area');
            if (ia) ia.classList.remove('hidden');
            const fa = document.getElementById('feedback-area');
            if (fa) fa.classList.add('hidden');
            const cp = document.getElementById('circle-path');
            if (cp) cp.style.animation = 'none';
            const cm = document.getElementById('checkmark');
            if (cm) {
                cm.style.opacity = '0';
                cm.classList.remove('show-check');
            }
            const nextWrapper = document.getElementById('next-btn-wrapper');
            if (nextWrapper) {
                nextWrapper.style.opacity = '0';
                nextWrapper.classList.remove('show-next');
            }
            
            const guideEl = document.getElementById('guide-text');
            if (guideEl) guideEl.style.display = "none";

            render();
            if (quizScreen) safeSetTimeout(() => quizScreen.classList.add('show'), 10);
        }, 500);
        const navTitle = document.getElementById('nav-category-title');
        if (navTitle) navTitle.innerText = selectedCategory;
    }, 500);
}

function goBack() {
    const quizScreen = document.getElementById('quiz-screen');
    if (quizScreen && !quizScreen.classList.contains('hidden')) {
        switchScreen('quiz-screen', 'category-screen');
    } else {
        switchScreen('result-screen', 'category-screen');
    }
}

function render() {
    const q = currentQuestions[currentIndex];
    if (!q || q.q === "ダミー") {
        alert("※このカテゴリは終活用のダミー枠（データ空）のため、クイズ画面はありません。");
        goBack();
        return;
    }

    document.getElementById('question-text').innerText = q.q;
    document.getElementById('quiz-image').src = q.image;
    
    const ia = document.getElementById('interactive-area');
    ia.innerHTML = '<div id="options-container"></div>';
    const container = document.getElementById('options-container');
    
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = function() {
            if (opt === q.answer) {
                btn.classList.add('selected');
                const allButtons = container.querySelectorAll('.option-btn');
                allButtons.forEach(b => b.disabled = true);
                
                safeSetTimeout(() => {
                    allButtons.forEach(b => { b.classList.add('fade-out'); });
                    safeSetTimeout(() => {
                        container.classList.add('hidden');
                        const fa = document.getElementById('feedback-area');
                        if (fa) fa.classList.remove('hidden');
                        const cp = document.getElementById('circle-path');
                        if (cp) cp.style.animation = 'drawCircle 1.0s forwards linear';
                        
                        safeSetTimeout(() => {
                            const cm = document.getElementById('checkmark');
                            if (cm) cm.classList.add('show-check');
                            const guideEl = document.getElementById('guide-text');
                            if (guideEl && q.guide) {
                                guideEl.innerText = q.guide;
                                guideEl.style.opacity = "0";
                                guideEl.style.display = "block";
                                guideEl.style.transition = "opacity 1.0s ease-in-out";
                                safeSetTimeout(() => { guideEl.style.opacity = "1"; }, 10);
                            }
                            
                            safeSetTimeout(() => {
                                const nextWrapper = document.getElementById('next-btn-wrapper');
                                if (nextWrapper) {
                                    nextWrapper.innerHTML = '';
                                    const nextBtn = document.createElement('button');
                                    nextBtn.className = 'option-btn';
                                    nextBtn.innerText = '次へ';
                                    nextBtn.style.width = "100%";
                                    nextBtn.style.textAlign = "center"; 
                                    
                                    nextBtn.onclick = function() {
    // 1. まず表示を完全にリセットする
    const fa = document.getElementById('feedback-area');
    const cm = document.getElementById('checkmark');
    const nextWrapper = document.getElementById('next-btn-wrapper');
    const guideEl = document.getElementById('guide-text');
    const container = document.getElementById('options-container');

    if (fa) fa.classList.add('hidden');
    if (cm) cm.classList.remove('show-check');
    if (nextWrapper) nextWrapper.classList.remove('show-next');
    if (guideEl) guideEl.style.display = "none";
    if (container) container.classList.remove('hidden');

    // 2. インデックスを更新して次の問題を描画
    currentIndex++;
    if (currentIndex < currentQuestions.length) {
        render();
                                        } else {
                                            showResult();
                                        }
                                    };
                                    nextWrapper.appendChild(nextBtn);
                                    nextWrapper.classList.add('show-next');
                                }
                            }, 2000); 
                        }, 1000); 
                    }, 1200); 
                }, 1000); 
            } else {
                btn.classList.add('fade-out');
                safeSetTimeout(() => btn.remove(), 1200);
            }
        };
        container.appendChild(btn);
    });
}

function showResult() {
    const quizScreen = document.getElementById('quiz-screen');
    if (quizScreen) {
        quizScreen.classList.remove('show');
        safeSetTimeout(() => {
            quizScreen.classList.add('hidden');
            quizScreen.style.display = 'none';
        }, 500);
    }
    
    const resultScreen = document.getElementById('result-screen');
    if (resultScreen) {
        resultScreen.style.display = 'block';
        resultScreen.classList.remove('hidden');
        
        // 画面が表示されてから紙吹雪を飛ばす
        safeSetTimeout(() => {
            resultScreen.classList.add('show');
            
            const container = document.getElementById('celebration-container');
            const medal = document.getElementById('result-medal');
            
            if (container) {
                // コンテナを確実に表示
                container.style.display = 'flex';
                
                // 古いパーティクルを掃除
                const oldConfetti = container.querySelectorAll('.confetti-particle');
                oldConfetti.forEach(el => el.remove());
                
                // 紙吹雪を生成
                const particles = ['🎉', '✨', '🌸', '🟡', '🟩', '🟥', '🔵'];
                for (let i = 0; i < 30; i++) {
                    const el = document.createElement('div');
                    el.className = 'confetti-particle';
                    el.innerText = particles[Math.floor(Math.random() * particles.length)];
                    
                    // 初期状態をセット
                    el.style.position = 'absolute';
                    el.style.left = '50%';
                    el.style.top = '50%';
                    el.style.fontSize = Math.floor(Math.random() * 12 + 16) + 'px';
                    el.style.transition = 'all 1.0s ease-out'; // アニメーションを少し緩やかに
                    el.style.pointerEvents = 'none';
                    el.style.zIndex = '5';
                    
                    container.appendChild(el);
                    
                    // 飛び散る計算
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * 100 + 40;
                    const x = Math.cos(angle) * distance;
                    const y = Math.sin(angle) * distance;
                    
                    // 少し遅れてアニメーション開始（これで確実に表示される）
                    safeSetTimeout(() => {
                        el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${Math.random() * 360}deg)`;
                        el.style.opacity = '0';
                    }, 50);
                }
                
                // メダルを表示
                if (medal) {
                    medal.style.opacity = '1';
                    medal.style.transform = 'scale(1)';
                }
            }
        }, 300); // 300ms待つことで描画を確実に待機
    }
}

function closePremiumModal() {
    const modal = document.getElementById('premium-modal');
    if (modal) modal.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    const sliderWrapper = document.querySelector('.category-slider-wrapper');
    const dot1 = document.getElementById('dot1');
    const dot2 = document.getElementById('dot2');

    if (sliderWrapper && dot1 && dot2) {
        sliderWrapper.addEventListener('scroll', () => {
            const pageLocation = sliderWrapper.scrollLeft;
            const pageWidth = sliderWrapper.clientWidth;
            if (pageLocation >= pageWidth / 2) {
                dot1.classList.remove('active');
                dot2.classList.add('active');
            } else {
                dot1.classList.add('active');
                dot2.classList.remove('active');
            }
        });
    }
});

function skipQuestion() {
    const fa = document.getElementById('feedback-area');
    if (fa) fa.classList.add('hidden');
    
    const checkmark = document.getElementById('checkmark');
    if (checkmark) checkmark.classList.remove('show-check');
    
    const nextWrapper = document.getElementById('next-btn-wrapper');
    if (nextWrapper) nextWrapper.classList.remove('show-next');
    
    const guideEl = document.getElementById('guide-text');
    if (guideEl) guideEl.style.display = "none";

    currentIndex++;
    
    if (currentIndex < currentQuestions.length) {
        render();
    } else {
        showResult();
    }
}
