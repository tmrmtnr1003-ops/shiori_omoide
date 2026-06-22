window.onload = function() {
    // ─── ① 起動時：スプラッシュ画面を6秒表示したあと、ウェルカム画面へ自動遷移 ───
    setTimeout(function() {
        const splash = document.getElementById('splash-screen');
        const welcome = document.getElementById('welcome-screen');
        
        if (splash) {
            splash.style.opacity = '0'; // フェードアウト
            setTimeout(function() { 
                splash.style.display = 'none'; 
                splash.classList.add('hidden');
                
                // ② ウェルカム画面を表示
                if (welcome) {
                    welcome.style.display = 'block';
                    welcome.classList.remove('hidden');
                    setTimeout(() => welcome.classList.add('show'), 10);
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
    document.getElementById('premium-modal').classList.add('hidden');
}

function debugJump(target) {
    clearAllScreens();
    toggleDebugMenu(); // メニューを閉じる
    
    if (target === 'splash') {
        const splash = document.getElementById('splash-screen');
        splash.style.display = 'flex';
        splash.classList.remove('hidden');
        setTimeout(() => splash.style.opacity = '1', 10);
    } else if (target === 'welcome') {
        const welcome = document.getElementById('welcome-screen');
        welcome.style.display = 'block';
        welcome.classList.remove('hidden');
        setTimeout(() => welcome.classList.add('show'), 10);
    } else if (target === 'loading') {
        const loading = document.getElementById('loading-screen');
        loading.style.display = 'flex';
        loading.classList.remove('hidden');
        setTimeout(() => loading.style.opacity = '1', 10);
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
        document.getElementById('premium-modal').classList.remove('hidden');
    }
}

function showCategoryScreenDirect() {
    const catScreen = document.getElementById('category-screen');
    catScreen.style.display = 'block';
    catScreen.classList.remove('hidden');
    setTimeout(() => catScreen.classList.add('show'), 10);
}

function debugToResult(cat) {
    clearAllScreens();
    toggleDebugMenu();
    selectedCategory = cat;
    
    const resultScreen = document.getElementById('result-screen');
    resultScreen.style.display = 'block';
    resultScreen.classList.remove('hidden');
    document.getElementById('result-image').src = "images/result_" + cat + ".jpg";
    setTimeout(() => resultScreen.classList.add('show'), 10);
}
// ────────────────────────────────────────

async function switchScreen(hideId, showId) {
    if (hideId) {
        const hideEl = document.getElementById(hideId);
        if (hideEl) {
            hideEl.classList.remove('show');
            await new Promise(r => setTimeout(r, 500));
            hideEl.classList.add('hidden');
            hideEl.style.display = 'none';
        }
    }
    const showEl = document.getElementById(showId);
    if (showEl) {
        showEl.style.display = 'block';
        showEl.classList.remove('hidden');
        await new Promise(r => setTimeout(r, 10));
        showEl.classList.add('show');
    }
}

let selectedCategory = null;
let currentQuestions = [];
let currentIndex = 0;

function showCategories() {
    // ③ ウェルカム画面で「はじめる」を押した時の正規の遷移
    const welcome = document.getElementById('welcome-screen');
    if (welcome) welcome.classList.remove('show');
    
    setTimeout(async () => {
        if (welcome) {
            welcome.classList.add('hidden');
            welcome.style.display = 'none';
        }
        
        // ④ 導入画面（loading-screen）を4秒間しっかり表示
        const loading = document.getElementById('loading-screen');
        if (loading) {
            loading.style.display = 'flex';
            loading.classList.remove('hidden');
            setTimeout(() => loading.style.opacity = '1', 10);
        }
        
        await new Promise(r => setTimeout(r, 4000));
        if (loading) loading.style.opacity = '0';
        
        setTimeout(() => {
            if (loading) {
                loading.classList.add('hidden');
                loading.style.display = 'none';
            }
            // ⑤ カテゴリ選択画面を表示
            showCategoryScreenDirect();
        }, 500);
    }, 500);
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

    setTimeout(() => {
        currentQuestions = quizData[selectedCategory];
        currentIndex = 0;
        document.getElementById('category-screen').classList.remove('show');
        setTimeout(() => {
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => card.classList.remove('selected'));
            const continueBtn = document.getElementById('continue-btn');
            if (continueBtn) continueBtn.disabled = true;

            document.getElementById('category-screen').classList.add('hidden');
            document.getElementById('category-screen').style.display = 'none';
            
            const quizScreen = document.getElementById('quiz-screen');
            quizScreen.style.display = 'block';
            quizScreen.classList.remove('hidden');
            
            document.getElementById('interactive-area').classList.remove('hidden');
            document.getElementById('feedback-area').classList.add('hidden');
            document.getElementById('circle-path').style.animation = 'none';
            document.getElementById('checkmark').style.opacity = '0';
            document.getElementById('checkmark').classList.remove('show-check');
            document.getElementById('next-btn-wrapper').style.opacity = '0';
            document.getElementById('next-btn-wrapper').classList.remove('show-next');
            
            const guideEl = document.getElementById('guide-text');
            if (guideEl) guideEl.style.display = "none";

            render();
            setTimeout(() => quizScreen.classList.add('show'), 10);
        }, 500);
        document.getElementById('nav-category-title').innerText = selectedCategory;
    }, 500);
}

function goBack() {
    if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
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
                
                setTimeout(() => {
                    allButtons.forEach(b => { b.classList.add('fade-out'); });
                    setTimeout(() => {
                        container.classList.add('hidden');
                        const fa = document.getElementById('feedback-area');
                        fa.classList.remove('hidden');
                        document.getElementById('circle-path').style.animation = 'drawCircle 1.0s forwards linear';
                        
                        setTimeout(() => {
                            document.getElementById('checkmark').classList.add('show-check');
                            const guideEl = document.getElementById('guide-text');
                            if (guideEl && q.guide) {
                                guideEl.innerText = q.guide;
                                guideEl.style.opacity = "0";
                                guideEl.style.display = "block";
                                guideEl.style.transition = "opacity 1.0s ease-in-out";
                                setTimeout(() => { guideEl.style.opacity = "1"; }, 10);
                            }
                            
                            setTimeout(() => {
                                const nextWrapper = document.getElementById('next-btn-wrapper');
                                nextWrapper.innerHTML = '';
                                const nextBtn = document.createElement('button');
                                nextBtn.className = 'option-btn';
                                nextBtn.innerText = '次へ';
                                nextBtn.style.width = "100%";
                                nextBtn.style.textAlign = "center"; 
                                
                                nextBtn.onclick = function() {
                                    currentIndex++;
                                    if (currentIndex < currentQuestions.length) {
                                        fa.classList.add('hidden');
                                        container.classList.remove('hidden');
                                        document.getElementById('checkmark').classList.remove('show-check');
                                        document.getElementById('next-btn-wrapper').classList.remove('show-next');
                                        if (guideEl) guideEl.style.display = "none";
                                        render();
                                    } else {
                                        showResult();
                                    }
                                };
                                nextWrapper.appendChild(nextBtn);
                                nextWrapper.classList.add('show-next');
                            }, 2000); 
                        }, 1000); 
                    }, 1200); 
                }, 1000); 
            } else {
                btn.classList.add('fade-out');
                setTimeout(() => btn.remove(), 1200);
            }
        };
        container.appendChild(btn);
    });
}
function showResult() {
    document.getElementById('quiz-screen').classList.remove('show');
    setTimeout(() => {
        document.getElementById('quiz-screen').classList.add('hidden');
        document.getElementById('quiz-screen').style.display = 'none';
        
        const resultScreen = document.getElementById('result-screen');
        resultScreen.style.display = 'block';
        resultScreen.classList.remove('hidden');
        
        setTimeout(() => {
            resultScreen.classList.add('show');
            
            const container = document.getElementById('celebration-container');
            const medal = document.getElementById('result-medal');
            
            if (container) {
                // 前回生成された紙吹雪のゴミ（div）だけをお掃除（メダル画像は残す）
                const oldConfetti = container.querySelectorAll('.confetti-particle');
                oldConfetti.forEach(el => el.remove());
                
                // メダルを一旦初期化（隠す）
                if (medal) {
                    medal.style.transform = 'scale(0)';
                    medal.style.opacity = '0';
                }
                
                // ① 紙吹雪を一斉に「パンッ」と弾けさせる（さっきの消える仕様）
                const particles = ['🎉', '✨', '🌸', '🟡', '🟩', '🟥', '🔵'];
                for (let i = 0; i < 30; i++) {
                    const el = document.createElement('div');
                    el.className = 'confetti-particle';
                    el.innerText = particles[Math.floor(Math.random() * particles.length)];
                    
                    el.style.position = 'absolute';
                    el.style.left = '50%';
                    el.style.top = '50%';
                    el.style.fontSize = Math.floor(Math.random() * 12 + 16) + 'px';
                    el.style.transform = 'translate(-50%, -50%)';
                    el.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
                    el.style.opacity = '1';
                    el.style.pointerEvents = 'none';
                    el.style.zIndex = '5';
                    
                    container.appendChild(el);
                    
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * 130 + 60; 
                    const x = Math.cos(angle) * distance;
                    const y = Math.sin(angle) * distance - 10; 
                    
                    setTimeout(() => {
                        el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${Math.random() * 360}deg)`;
                        el.style.opacity = '0'; // 紙吹雪は綺麗に消える
                    }, 10);
                }
                
                // ② 紙吹雪が広がった一瞬あと（0.15秒後）にメダルをポンッと飛び出させて残す
                if (medal) {
                    setTimeout(() => {
                        medal.style.opacity = '1';
                        medal.style.transform = 'scale(1)'; // バウンドしながらきれいに残る
                    }, 150);
                }
            }
        }, 10);
    }, 500);
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
// ─── ⏩ クイズをスキップする関数（確認なしで即実行） ───
function skipQuestion() {
    // 1. 解説エリアや丸バツ表示がもし出ていたらきれいに隠す
    const fa = document.getElementById('feedback-area');
    if (fa) fa.classList.add('hidden');
    
    const checkmark = document.getElementById('checkmark');
    if (checkmark) checkmark.classList.remove('show-check');
    
    const nextWrapper = document.getElementById('next-btn-wrapper');
    if (nextWrapper) nextWrapper.classList.remove('show-next');
    
    const guideEl = document.getElementById('guide-text');
    if (guideEl) guideEl.style.display = "none";

    // 2. 次の問題へ進む
    currentIndex++;
    
    if (currentIndex < currentQuestions.length) {
        // まだ次の問題がある場合は、次のクイズを画面に描画
        render();
    } else {
        // これが最後の問題だった場合は、リザルト画面（結果画面）へ直行
        showResult();
    }
}