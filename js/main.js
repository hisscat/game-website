 // 使用 DOMContentLoaded 确保DOM完全加载
        document.addEventListener('DOMContentLoaded', initGameApp);
        
        // 游戏数据
        const games = [
            {
                id: 1,
                title: "拧螺丝",
                description: "别笑你也过不了第二关",
                category: "puzzle",
                emoji: "🧩",
                gradient: "linear-gradient(135deg, #667eea, #764ba2)",
                image: "images/yujie.png",
                url: "test.html" // 新增跳转链接
            }
            
        ];

        // 全局变量
        let currentCategory = 'all';
        let filteredGames = games;
        let debounceTimeout = null;

        /**
         * 渲染游戏卡片
         * @param {Array} gamesToRender - 要渲染的游戏数组
         */
        function renderGames(gamesToRender) {
            const gamesGrid = document.getElementById('gamesGrid');
            const fragment = document.createDocumentFragment(); // 使用文档片段提高性能
            
            // 清空网格
            gamesGrid.innerHTML = '';
            
            // 如果没有游戏匹配，显示提示信息
            if (gamesToRender.length === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.textContent = '没有找到匹配的游戏，请尝试其他关键词';
                noResults.style.gridColumn = '1 / -1';
                noResults.style.textAlign = 'center';
                noResults.style.padding = '40px 0';
                noResults.style.fontSize = '1.2rem';
                gamesGrid.appendChild(noResults);
                return;
            }

            // 创建并添加游戏卡片
            gamesToRender.forEach((game, index) => {
                const gameCard = document.createElement('div');
                gameCard.className = 'game-card';
                gameCard.setAttribute('role', 'listitem');
                gameCard.setAttribute('data-game-id', game.id);
                gameCard.setAttribute('data-category', game.category);
                gameCard.setAttribute('tabindex', '0'); // 使卡片可聚焦
                gameCard.style.animationDelay = `${index * 0.1}s`;
                
                // 使用模板字符串创建卡片内容
                gameCard.innerHTML = `
                    <div class="game-image" style="background: ${game.gradient}" aria-label="${game.title}游戏图像">
                        ${game.image ? `<img src="${game.image}" alt="${game.title}图片" style="width:100%;height:100%;object-fit:cover;border-radius:20px 20px 0 0;">` : `<span role="img" aria-label="${game.title}图标">${game.emoji}</span>`}
                    </div>
                    <div class="game-info">
                        <h3 class="game-title">${game.title}</h3>
                        <p class="game-description">${game.description}</p>
                        <div class="game-meta">
                            <span class="game-category">${getCategoryName(game.category)}</span>
                            <button class="play-btn" aria-label="开始${game.title}游戏">开始游戏</button>
                        </div>
                    </div>
                `;

                // 添加点击事件（使用事件委托而不是内联onclick）
                const playBtn = gameCard.querySelector('.play-btn');
                playBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    playGame(game.title);
                });
                
                // 整个卡片也可点击
                gameCard.addEventListener('click', () => {
                    playGame(game.title);
                });
                
                // 添加键盘支持
                gameCard.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        playGame(game.title);
                    }
                });

                // 添加到文档片段
                fragment.appendChild(gameCard);
            });
            
            // 一次性添加所有卡片到DOM
            gamesGrid.appendChild(fragment);

            // 添加入场动画
            requestAnimationFrame(() => {
                const cards = gamesGrid.querySelectorAll('.game-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 50); // 减少延迟时间提高响应速度
                });
            });
            
            // 添加鼠标跟随效果
            addMouseFollowEffect();
        }

        // 获取分类中文名
        function getCategoryName(category) {
            const categoryNames = {
                puzzle: '益智',
                action: '动作',
                casual: '休闲',
                strategy: '策略',
                arcade: '街机'
            };
            return categoryNames[category] || category;
        }

        // 筛选游戏
        function filterGames(category) {
            if (category === 'all') {
                filteredGames = games;
            } else {
                filteredGames = games.filter(game => game.category === category);
            }
            renderGames(filteredGames);
        }

        // 搜索游戏 - 使用防抖优化
        function searchGames(query) {
            // 清除之前的定时器
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
            
            // 设置新的定时器，300ms后执行搜索
            debounceTimeout = setTimeout(() => {
                const normalizedQuery = query.toLowerCase().trim();
                
                // 如果查询为空，恢复当前分类的所有游戏
                if (!normalizedQuery) {
                    filterGames(currentCategory);
                    return;
                }
                
                // 从当前分类中筛选
                const baseGames = currentCategory === 'all' ? games : games.filter(game => game.category === currentCategory);
                
                // 搜索标题和描述
                const searchResults = baseGames.filter(game => 
                    game.title.toLowerCase().includes(normalizedQuery) ||
                    game.description.toLowerCase().includes(normalizedQuery)
                );
                
                renderGames(searchResults);
            }, 300);
        }

        // 播放游戏（示例函数）
        function playGame(gameName) {
            // 查找游戏对象
            const game = games.find(g => g.title === gameName);
            if (game && game.url) {
                window.open(game.url, "_blank"); // 新窗口打开
            } else {
                alert(`未找到 "${gameName}" 的链接`);
            }
        }

        /**
         * 为游戏卡片添加鼠标跟随3D效果
         */
        function addMouseFollowEffect() {
            // 检测设备是否支持触摸（移动设备不应用3D效果）
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            if (isTouchDevice) return;
            
            document.querySelectorAll('.game-card').forEach(card => {
                // 防止重复绑定
                card.onmousemove = card.onmouseleave = null;

                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    // 限制最大旋转角度为12度
                    const maxAngle = 12;
                    let rotateX = ((y / rect.height) - 0.5) * -24;
                    let rotateY = ((x / rect.width) - 0.5) * 24;
                    rotateX = Math.max(-maxAngle, Math.min(maxAngle, rotateX));
                    rotateY = Math.max(-maxAngle, Math.min(maxAngle, rotateY));
                    
                    // 使用 requestAnimationFrame 优化性能
                    requestAnimationFrame(() => {
                        card.style.transition = 'transform 0.08s cubic-bezier(0.4,0,0.2,1)';
                        card.style.transform = `
                            perspective(800px)
                            rotateX(${rotateX}deg)
                            rotateY(${rotateY}deg)
                            scale(1.04)
                        `;
                    });
                });

                card.addEventListener('mouseleave', () => {
                    requestAnimationFrame(() => {
                        card.style.transition = 'transform 0.3s cubic-bezier(0.4,0,0.2,1)';
                        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
                    });
                });
            });
        }

        /**
         * 初始化游戏应用
         */
        function initGameApp() {
            // 添加卡片初始样式
            const style = document.createElement('style');
            style.textContent = `
                .game-card {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.5s ease;
                }
                
                /* 添加键盘焦点样式 */
                .game-card:focus-visible {
                    box-shadow: 0 0 0 3px #ffffff, 0 20px 40px rgba(0, 0, 0, 0.3);
                }
                
                /* 添加加载状态 */
                .loaded .game-card {
                    transition: all 0.5s ease;
                }
            `;
            document.head.appendChild(style);
            
            // 初始化游戏显示
            renderGames(games);
            
            // 为分类按钮添加无障碍支持
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.setAttribute('role', 'button');
                btn.setAttribute('tabindex', '0');
                btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
                
                // 添加键盘支持
                btn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        btn.click();
                    }
                });
            });

            // 分类按钮点击事件 - 使用事件委托
            const categoriesContainer = document.querySelector('.categories');
            categoriesContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.category-btn');
                if (!btn) return;
                
                document.querySelectorAll('.category-btn').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                
                currentCategory = btn.dataset.category;
                filterGames(currentCategory);
            });

            // 搜索功能
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', (e) => {
                searchGames(e.target.value);
            });
            
            // 添加搜索框清除按钮功能
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    searchInput.value = '';
                    filterGames(currentCategory);
                }
            });
            
            // 添加页面加载完成标记
            document.body.classList.add('loaded');
            
            // 添加离线支持提示
            window.addEventListener('online', () => {
                console.log('网络已连接');
            });
            
            window.addEventListener('offline', () => {
                console.log('网络已断开，但游戏仍可使用');
            });
        }
