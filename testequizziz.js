
(function() {
    'use strict';

    // -----------------------------------------------------------------------------------
    // CONFIGURAÇÃO DE CHAVES DE API (MODAL INTERATIVO)
    // -----------------------------------------------------------------------------------
    let GEMINI_API_KEYS = [];
    let OPENROUTER_API_KEYS = [];
    let currentAiProvider = 'gemini';
    const DEEPSEEK_MODEL_NAME = "deepseek/deepseek-chat";

    // Função para verificar quais provedores estão disponíveis
    function getAvailableProviders() {
        const providers = [];
        if (GEMINI_API_KEYS.length > 0 && GEMINI_API_KEYS.some(key => key && key.length > 30)) {
            providers.push('gemini');
        }
        if (OPENROUTER_API_KEYS.length > 0 && OPENROUTER_API_KEYS.some(key => key && key.length > 30)) {
            providers.push('deepseek');
        }
        return providers;
    }

    // Função para determinar o provedor padrão
    function getDefaultProvider(availableProviders) {
        if (availableProviders.length === 0) return 'gemini';
        return availableProviders[0];
    }

    // Função para mostrar o modal de configuração
    function showApiKeyModal() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.id = 'api-key-modal';
            Object.assign(modal.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                zIndex: '2147483647',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'system-ui, sans-serif'
            });

            const modalContent = document.createElement('div');
            Object.assign(modalContent.style, {
                background: 'rgba(26, 27, 30, 0.95)',
                padding: '30px',
                borderRadius: '16px',
                color: 'white',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            });

            const title = document.createElement('h2');
            title.innerText = '🔑 Configuração de Chaves API - MLK MAU';
            Object.assign(title.style, {
                margin: '0 0 20px 0',
                textAlign: 'center',
                color: '#8b5cf6'
            });

            const description = document.createElement('p');
            description.innerText = 'Cole suas chaves de API abaixo. Você pode configurar até 3 chaves para cada serviço (mínimo 1).';
            Object.assign(description.style, {
                margin: '0 0 25px 0',
                lineHeight: '1.5',
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center'
            });

            // --- TOGGLE SWITCH PARA SALVAR NO STORAGE ---
            const storageToggleContainer = document.createElement('div');
            Object.assign(storageToggleContainer.style, {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '25px',
                padding: '12px 16px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            });

            const storageToggleLabel = document.createElement('span');
            storageToggleLabel.innerText = '💾 Salvar chaves no navegador';
            Object.assign(storageToggleLabel.style, {
                fontSize: '14px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.9)'
            });

            const storageToggle = document.createElement('label');
            Object.assign(storageToggle.style, {
                position: 'relative',
                display: 'inline-block',
                width: '50px',
                height: '24px'
            });

            const storageToggleInput = document.createElement('input');
            storageToggleInput.type = 'checkbox';
            storageToggleInput.checked = true;
            Object.assign(storageToggleInput.style, {
                opacity: '0',
                width: '0',
                height: '0'
            });

            const storageToggleSlider = document.createElement('span');
            Object.assign(storageToggleSlider.style, {
                position: 'absolute',
                cursor: 'pointer',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                backgroundColor: '#ccc',
                transition: '0.4s',
                borderRadius: '24px'
            });

            const storageToggleSliderBefore = document.createElement('span');
            Object.assign(storageToggleSliderBefore.style, {
                position: 'absolute',
                content: '""',
                height: '16px',
                width: '16px',
                left: '4px',
                bottom: '4px',
                backgroundColor: 'white',
                transition: '0.4s',
                borderRadius: '50%'
            });

            const updateToggleStyle = () => {
                if (storageToggleInput.checked) {
                    storageToggleSlider.style.backgroundColor = '#8b5cf6';
                    storageToggleSliderBefore.style.transform = 'translateX(26px)';
                } else {
                    storageToggleSlider.style.backgroundColor = '#ccc';
                    storageToggleSliderBefore.style.transform = 'translateX(0)';
                }
            };

            storageToggleInput.addEventListener('change', updateToggleStyle);
            updateToggleStyle();

            storageToggle.appendChild(storageToggleInput);
            storageToggle.appendChild(storageToggleSlider);
            storageToggleSlider.appendChild(storageToggleSliderBefore);
            storageToggleContainer.appendChild(storageToggleLabel);
            storageToggleContainer.appendChild(storageToggle);

            try {
                const savePreference = localStorage.getItem('mlk_mau_save_keys');
                if (savePreference !== null) {
                    storageToggleInput.checked = savePreference === 'true';
                    updateToggleStyle();
                }
            } catch (e) {
                console.warn('Não foi possível carregar preferência de salvamento:', e);
            }

            // Container para os campos Gemini
            const geminiSection = document.createElement('div');
            
            const geminiHeader = document.createElement('div');
            Object.assign(geminiHeader.style, {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px'
            });
            
            const geminiTitle = document.createElement('h3');
            geminiTitle.innerText = 'Gemini API Keys';
            Object.assign(geminiTitle.style, {
                color: '#a78bfa',
                margin: '0',
                fontSize: '16px'
            });

            const geminiLink = document.createElement('a');
            geminiLink.innerText = '🔗 gere sua api aqui';
            geminiLink.href = 'https://aistudio.google.com/app/apikey';
            geminiLink.target = '_blank';
            Object.assign(geminiLink.style, {
                color: '#8b5cf6',
                fontSize: '12px',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
            });

            geminiLink.addEventListener('mouseover', () => {
                geminiLink.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                geminiLink.style.transform = 'translateY(-1px)';
            });

            geminiLink.addEventListener('mouseout', () => {
                geminiLink.style.backgroundColor = 'transparent';
                geminiLink.style.transform = 'translateY(0)';
            });

            geminiHeader.appendChild(geminiTitle);
            geminiHeader.appendChild(geminiLink);
            geminiSection.appendChild(geminiHeader);
            
            const geminiContainer = document.createElement('div');
            Object.assign(geminiContainer.style, {
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '25px'
            });

            for (let i = 1; i <= 3; i++) {
                const inputGroup = document.createElement('div');
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `Chave Gemini ${i} (Opcional)`;
                input.dataset.index = i - 1;
                input.dataset.type = 'gemini';
                
                Object.assign(input.style, {
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: 'white',
                    fontSize: '14px',
                    width: '100%',
                    boxSizing: 'border-box'
                });

                inputGroup.appendChild(input);
                geminiContainer.appendChild(inputGroup);
            }
            geminiSection.appendChild(geminiContainer);

            // Container para os campos OpenRouter
            const openRouterSection = document.createElement('div');
            
            const openRouterHeader = document.createElement('div');
            Object.assign(openRouterHeader.style, {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px'
            });
            
            const openRouterTitle = document.createElement('h3');
            openRouterTitle.innerText = 'OpenRouter API Keys';
            Object.assign(openRouterTitle.style, {
                color: '#a78bfa',
                margin: '0',
                fontSize: '16px'
            });

            const openRouterLink = document.createElement('a');
            openRouterLink.innerText = '🔗 gere sua api aqui';
            openRouterLink.href = 'https://openrouter.ai/settings/keys';
            openRouterLink.target = '_blank';
            Object.assign(openRouterLink.style, {
                color: '#8b5cf6',
                fontSize: '12px',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
            });

            openRouterLink.addEventListener('mouseover', () => {
                openRouterLink.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                openRouterLink.style.transform = 'translateY(-1px)';
            });

            openRouterLink.addEventListener('mouseout', () => {
                openRouterLink.style.backgroundColor = 'transparent';
                openRouterLink.style.transform = 'translateY(0)';
            });

            openRouterHeader.appendChild(openRouterTitle);
            openRouterHeader.appendChild(openRouterLink);
            openRouterSection.appendChild(openRouterHeader);
            
            const openRouterContainer = document.createElement('div');
            Object.assign(openRouterContainer.style, {
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '30px'
            });

            for (let i = 1; i <= 3; i++) {
                const inputGroup = document.createElement('div');
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `Chave OpenRouter ${i} (Opcional)`;
                input.dataset.index = i - 1;
                input.dataset.type = 'openrouter';
                
                Object.assign(input.style, {
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: 'white',
                    fontSize: '14px',
                    width: '100%',
                    boxSizing: 'border-box'
                });

                inputGroup.appendChild(input);
                openRouterContainer.appendChild(inputGroup);
            }
            openRouterSection.appendChild(openRouterContainer);

            // Botão de salvar
            const saveButton = document.createElement('button');
            saveButton.innerText = '💾 Salvar e Iniciar Script';
            Object.assign(saveButton.style, {
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                padding: '15px 30px',
                width: '100%',
                transition: 'all 0.2s ease'
            });

            saveButton.addEventListener('mouseover', () => {
                saveButton.style.transform = 'translateY(-2px)';
                saveButton.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
            });

            saveButton.addEventListener('mouseout', () => {
                saveButton.style.transform = 'translateY(0)';
                saveButton.style.boxShadow = 'none';
            });

            saveButton.addEventListener('click', () => {
                // Coletar chaves Gemini
                const geminiInputs = modalContent.querySelectorAll('input[data-type="gemini"]');
                const geminiKeys = Array.from(geminiInputs)
                    .map(input => input.value.trim())
                    .filter(key => key && key.length > 30 && !key.includes("SUA_CHAVE"));

                // Coletar chaves OpenRouter
                const openRouterInputs = modalContent.querySelectorAll('input[data-type="openrouter"]');
                const openRouterKeys = Array.from(openRouterInputs)
                    .map(input => input.value.trim())
                    .filter(key => key && key.length > 30 && !key.includes("SUA_CHAVE"));

                // Validar pelo menos uma chave
                if (geminiKeys.length === 0 && openRouterKeys.length === 0) {
                    alert('❌ Por favor, insira pelo menos uma chave API válida para Gemini ou OpenRouter.');
                    return;
                }

                const shouldSaveToStorage = storageToggleInput.checked;

                try {
                    localStorage.setItem('mlk_mau_save_keys', shouldSaveToStorage.toString());
                } catch (e) {
                    console.warn('Não foi possível salvar preferência de storage:', e);
                }

                // Atualizar arrays globais
                GEMINI_API_KEYS = geminiKeys.length > 0 ? geminiKeys : [];
                OPENROUTER_API_KEYS = openRouterKeys.length > 0 ? openRouterKeys : [];

                if (shouldSaveToStorage) {
                    try {
                        localStorage.setItem('mlk_mau_gemini_keys', JSON.stringify(GEMINI_API_KEYS));
                        localStorage.setItem('mlk_mau_openrouter_keys', JSON.stringify(OPENROUTER_API_KEYS));
                        console.log('Chaves API salvas no localStorage');
                    } catch (e) {
                        console.warn('Não foi possível salvar chaves no localStorage:', e);
                    }
                } else {
                    try {
                        localStorage.removeItem('mlk_mau_gemini_keys');
                        localStorage.removeItem('mlk_mau_openrouter_keys');
                        console.log('Chaves API removidas do localStorage (salvamento desativado)');
                    } catch (e) {
                        console.warn('Não foi possível remover chaves do localStorage:', e);
                    }
                }

                console.log('Chaves API configuradas:', {
                    gemini: GEMINI_API_KEYS,
                    openrouter: OPENROUTER_API_KEYS,
                    savedToStorage: shouldSaveToStorage
                });

                modal.remove();
                resolve();
            });

            // Montar modal
            modalContent.appendChild(title);
            modalContent.appendChild(description);
            modalContent.appendChild(storageToggleContainer);
            modalContent.appendChild(geminiSection);
            modalContent.appendChild(openRouterSection);
            modalContent.appendChild(saveButton);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            // Tentar carregar chaves salvas
            try {
                const savePreference = localStorage.getItem('mlk_mau_save_keys');
                const shouldLoadKeys = savePreference === null || savePreference === 'true';
                
                if (shouldLoadKeys) {
                    const savedGeminiKeys = JSON.parse(localStorage.getItem('mlk_mau_gemini_keys') || '[]');
                    const savedOpenRouterKeys = JSON.parse(localStorage.getItem('mlk_mau_openrouter_keys') || '[]');
                    
                    if (savedGeminiKeys.length > 0 || savedOpenRouterKeys.length > 0) {
                        savedGeminiKeys.forEach((key, index) => {
                            const input = modalContent.querySelector(`input[data-type="gemini"][data-index="${index}"]`);
                            if (input && key) input.value = key;
                        });
                        
                        savedOpenRouterKeys.forEach((key, index) => {
                            const input = modalContent.querySelector(`input[data-type="openrouter"][data-index="${index}"]`);
                            if (input && key) input.value = key;
                        });
                    }
                }
            } catch (e) {
                console.warn('Não foi possível carregar chaves salvas:', e);
            }
        });
    }

    // -----------------------------------------------------------------------------------
    // INICIALIZAÇÃO DA SCRIPT
    // -----------------------------------------------------------------------------------
    async function initializeScript() {
        // Verificar se já existem chaves salvas
        try {
            const savePreference = localStorage.getItem('mlk_mau_save_keys');
            const shouldLoadKeys = savePreference === null || savePreference === 'true';
            
            if (shouldLoadKeys) {
                const savedGeminiKeys = JSON.parse(localStorage.getItem('mlk_mau_gemini_keys') || '[]');
                const savedOpenRouterKeys = JSON.parse(localStorage.getItem('mlk_mau_openrouter_keys') || '[]');
                
                if (savedGeminiKeys.length > 0 || savedOpenRouterKeys.length > 0) {
                    GEMINI_API_KEYS = savedGeminiKeys;
                    OPENROUTER_API_KEYS = savedOpenRouterKeys;
                    console.log('Chaves carregadas do localStorage (preferência de salvamento: ativa)');
                } else {
                    await showApiKeyModal();
                }
            } else {
                console.log('Preferência de salvamento: desativada - solicitando chaves...');
                await showApiKeyModal();
            }
        } catch (e) {
            console.warn('Erro ao verificar preferência de salvamento:', e);
            await showApiKeyModal();
        }

        // Determinar provedores disponíveis e configurar o provedor padrão
        const availableProviders = getAvailableProviders();
        currentAiProvider = getDefaultProvider(availableProviders);

        console.log('Script MLK MAU inicializado com sucesso!');
        console.log('Chaves Gemini configuradas:', GEMINI_API_KEYS.length);
        console.log('Chaves OpenRouter configuradas:', OPENROUTER_API_KEYS.length);
        console.log('Provedores disponíveis:', availableProviders);
        console.log('Provedor padrão:', currentAiProvider);

        // Resto das variáveis e funções...
        let currentApiKeyIndex = 0;
        let currentOpenRouterKeyIndex = 0;
        let lastAiResponse = '';

        // --- DETECÇÃO DE QUIZ ID ---
        const regexQuizId = /\/(?:quiz|quizzes|admin\/quiz|games|attempts|join)\/([a-f0-9]{24})/i;
        let quizIdDetected = null;
        let interceptorsStarted = false;

        // --- FUNÇÕES UTILITÁRIAS ---

        function waitForElement(selector, all = false, timeout = 5000) {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                const interval = setInterval(() => {
                    const elements = all ? document.querySelectorAll(selector) : document.querySelector(selector);
                    if ((all && elements.length > 0) || (!all && elements)) {
                        clearInterval(interval);
                        resolve(elements);
                    } else if (Date.now() - startTime > timeout) {
                        clearInterval(interval);
                        reject(new Error(`Elemento(s) "${selector}" não encontrado(s) após ${timeout / 1000} segundos.`));
                    }
                }, 100);
            });
        }

        function waitForElementToDisappear(selector, timeout = 5000) {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                const interval = setInterval(() => {
                    const element = document.querySelector(selector);
                    if (!element) {
                        clearInterval(interval);
                        resolve();
                    } else if (Date.now() - startTime > timeout) {
                        clearInterval(interval);
                        reject(new Error(`Elemento "${selector}" não desapareceu após ${timeout / 1000} segundos.`));
                    }
                }, 100);
            });
        }

        // --- LÓGICA DO RESOLVEDOR ---

        async function extrairDadosDaQuestao() {
        try {
            const questionTextElement = document.querySelector('#questionText');
            const questionText = questionTextElement ? questionTextElement.innerText.trim().replace(/\s+/g, ' ') : "Não foi possível encontrar o texto da pergunta.";
            const questionImageElement = document.querySelector('img[data-testid="question-container-image"]');
            const questionImageUrl = questionImageElement ? questionImageElement.src : null;

            const extractText = (el) => {
                const mathElement = el.querySelector('annotation[encoding="application/x-tex"]');
                return mathElement ? mathElement.textContent.trim() : el.querySelector('#optionText')?.innerText.trim() || '';
            };

            const dropdownButtons = document.querySelectorAll('button.options-dropdown');
            if (dropdownButtons.length > 1) {
                console.log("Tipo Múltiplos Dropdowns detectado.");
                const dropdowns = [];
                let questionTextWithPlaceholders = questionTextElement.innerHTML;
                const popperSelector = '.v-popper__popper--shown';

                dropdownButtons.forEach((btn, i) => {
                    const placeholder = ` [RESPOSTA ${i + 1}] `;
                    const wrapper = btn.closest('.dropdown-wrapper');
                    if (wrapper) {
                         questionTextWithPlaceholders = questionTextWithPlaceholders.replace(wrapper.outerHTML, placeholder);
                    }
                });

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = questionTextWithPlaceholders;
                const cleanQuestionText = tempDiv.innerText.replace(/\s+/g, ' ');

                let allAvailableOptions = [];
                const firstBtn = dropdownButtons[0];
                firstBtn.click();
                try {
                    const optionElements = await waitForElement(`${popperSelector} button.dropdown-option`, true, 2000);
                    allAvailableOptions = Array.from(optionElements).map(el => el.innerText.trim());
                    console.log("Pool de opções detectado:", allAvailableOptions);
                } catch (e) {
                    console.error("Falha ao ler o pool de opções do primeiro dropdown.", e);
                    if (document.querySelector(popperSelector)) document.body.click();
                }

                if (document.querySelector(popperSelector)) document.body.click();
                try {
                    await waitForElementToDisappear(popperSelector, 2000);
                } catch (e) {
                    console.warn("Popper não fechou, mas continuando...");
                }

                dropdownButtons.forEach((btn, i) => {
                     dropdowns.push({
                        button: btn,
                        placeholder: `[RESPOSTA ${i + 1}]`
                    });
                });

                console.log("Texto Limpo Enviado para IA:", cleanQuestionText);
                return { questionText: cleanQuestionText, questionImageUrl, questionType: 'multi_dropdown', dropdowns, allAvailableOptions };
            }

            if (dropdownButtons.length === 1) {
                return { questionText, questionImageUrl, questionType: 'dropdown', dropdownButton: dropdownButtons[0] };
            }

            const equationEditor = document.querySelector('div[data-cy="equation-editor"]');
            if (equationEditor) {
                return { questionText, questionImageUrl, questionType: 'equation' };
            }
            const droppableBlanks = document.querySelectorAll('button.droppable-blank');
            const dragOptions = document.querySelectorAll('.drag-option');
            if (droppableBlanks.length > 1 && dragOptions.length > 0) {
                const questionContainer = document.querySelector('.drag-drop-text > div');
                const dropZones = [];
                if (questionContainer) {
                    const children = Array.from(questionContainer.children);
                    for (let i = 0; i < children.length; i++) {
                        const blankButton = children[i].querySelector('button.droppable-blank');
                        if (blankButton) {
                            const precedingSpan = children[i - 1];
                            if (precedingSpan && precedingSpan.tagName === 'SPAN') {
                                let promptText = precedingSpan.innerText.trim().replace(/:\s*$/, '').replace(/\s+/g, ' ');
                                dropZones.push({ prompt: promptText, blankElement: blankButton });
                            }
                        }
                    }
                }
                const draggableOptions = Array.from(dragOptions).map(el => ({ text: el.innerText.trim(), element: el }));
                return { questionText: questionContainer.innerText.trim(), questionImageUrl, questionType: 'multi_drag_into_blank', draggableOptions, dropZones };
            }
            if (droppableBlanks.length === 1 && dragOptions.length > 0) {
                 const draggableOptions = Array.from(dragOptions).map(el => ({ text: el.querySelector('.dnd-option-text')?.innerText.trim() || '', element: el }));
                return { questionText, questionImageUrl, questionType: 'drag_into_blank', draggableOptions, dropZone: { element: droppableBlanks[0] } };
            }

            const matchContainer = document.querySelector('.match-order-options-container, .question-options-layout');
            if (matchContainer) {
                const draggableItemElements = Array.from(matchContainer.querySelectorAll('.match-order-option.is-option-tile'));
                const dropZoneElements = Array.from(matchContainer.querySelectorAll('.match-order-option.is-drop-tile'));

                const isImageMatch = draggableItemElements.length > 0 && (draggableItemElements[0].querySelector('.option-image') || draggableItemElements[0].dataset.type === 'image');

                if (isImageMatch) {
                    console.log("Tipo Match-Order (Imagem p/ Texto) detectado.");
                    const draggableItems = [];
                    for (let i = 0; i < draggableItemElements.length; i++) {
                        const el = draggableItemElements[i];
                        const imgDiv = el.querySelector('.option-image');
                        const style = imgDiv ? window.getComputedStyle(imgDiv).backgroundImage : null;
                        const urlMatch = style ? style.match(/url\("(.+?)"\)/) : null;
                        let imageUrl = urlMatch ? urlMatch[1] : null;

                        if (!imageUrl) {
                            const dataCy = el.dataset.cy;
                            if (dataCy && dataCy.includes('url(')) {
                                const urlMatchCy = dataCy.match(/url\((.+)\)/);
                                if (urlMatchCy) imageUrl = urlMatchCy[1].replace(/\?w=\d+&h=\d+$/, '');
                            }
                        }

                        if (imageUrl) {
                            draggableItems.push({ id: `IMAGEM ${i + 1}`, imageUrl, element: el });
                        }
                    }

                    const dropZones = dropZoneElements.map(el => ({ text: extractText(el), element: el }));

                    return { questionText, questionImageUrl, questionType: 'match_image_to_text', draggableItems, dropZones };

                } else if (draggableItemElements.length > 0 && dropZoneElements.length > 0) {
                    const draggableItems = draggableItemElements.map(el => ({ text: extractText(el), element: el }));
                    const dropZones = dropZoneElements.map(el => ({ text: extractText(el), element: el }));

                    const questionType = questionText.toLowerCase().includes('reorder') ? 'reorder' : 'match_order';
                    return { questionText, questionImageUrl, questionType, draggableItems, dropZones };
                }
            }

            const openEndedTextarea = document.querySelector('textarea[data-cy="open-ended-textarea"]');
            if (openEndedTextarea) {
                return { questionText, questionImageUrl, questionType: 'open_ended', answerElement: openEndedTextarea };
            }
            const optionElements = document.querySelectorAll('.option.is-selectable');
            if (optionElements.length > 0) {
                const isMultipleChoice = Array.from(optionElements).some(el => el.classList.contains('is-msq'));
                const options = Array.from(optionElements).map(el => ({ text: extractText(el), element: el }));
                return { questionText, questionImageUrl, questionType: isMultipleChoice ? 'multiple_choice' : 'single_choice', options };
            }
            console.error("Tipo de questão não reconhecido.");
            return null;
        } catch (error) {
            console.error("Erro ao extrair dados da questão:", error);
            return null;
        }
    }

        async function obterRespostaDaIA(quizData) {
            lastAiResponse = '';
            const viewResponseBtn = document.getElementById('view-raw-response-btn');
            if (viewResponseBtn) viewResponseBtn.style.display = 'none';

            // --- 1. Lógica de Prompt ---
            let promptDeInstrucao = "", formattedOptions = "";
            switch (quizData.questionType) {
                case 'multi_dropdown':
                    promptDeInstrucao = `Esta é uma questão com múltiplas lacunas ([RESPOSTA X]). As opções disponíveis são um pool compartilhado e cada opção só pode ser usada uma vez. Determine a resposta correta para CADA placeholder. Responda com cada resposta em uma nova linha, no formato '[RESPOSTA X]: Resposta Correta'. Se algum placeholder não tiver uma resposta lógica no pool (ex: está fora da sequência), omita-o da resposta.`;
                    formattedOptions = "Pool de Opções Disponíveis: " + quizData.allAvailableOptions.join(', ');
                    break;
                case 'match_image_to_text':
                    promptDeInstrucao = `Esta é uma questão de combinar imagens com seus textos correspondentes. Para cada imagem, forneça o par correto no formato EXATO: 'Texto da Opção -> ID da Imagem' (ex: 90° -> IMAGEM 3), com cada par em uma nova linha.`;
                    const dropZoneTexts = quizData.dropZones.map(item => `- "${item.text}"`).join('\n');
                    formattedOptions = `Opções de Texto (Locais para Soltar):\n${dropZoneTexts}`;
                    break;
                case 'match_order':
                    promptDeInstrucao = `Responda com os pares no formato EXATO: 'Texto do Local para Soltar -> Texto do Item para Arrastar', com cada par em uma nova linha.`;
                    const draggables = quizData.draggableItems.map(item => `- "${item.text}"`).join('\n');
                    const droppables = quizData.dropZones.map(item => `- "${item.text}"`).join('\n');
                    formattedOptions = `Itens para Arrastar:\n${draggables}\n\nLocais para Soltar:\n${droppables}`;
                    break;
                case 'multi_drag_into_blank': promptDeInstrucao = `Esta é uma questão de combinar múltiplas sentenças com suas expressões corretas. Responda com os pares no formato EXATO: 'Sentença da pergunta -> Expressão da opção', com cada par em uma nova linha.`; const prompts = quizData.dropZones.map(item => `- "${item.prompt}"`).join('\n'); const options = quizData.draggableOptions.map(item => `- "${item.text}"`).join('\n'); formattedOptions = `Sentenças:\n${prompts}\n\nExpressões (Opções):\n${options}`; break;
                case 'equation': promptDeInstrucao = `Resolva a seguinte equação ou inequação. Forneça apenas a expressão final simplificada (ex: x = 5, ou y > 3).`; formattedOptions = `EQUAÇÃO: "${quizData.questionText}"`; break;
                case 'dropdown': case 'single_choice': promptDeInstrucao = `Responda APENAS com o texto exato da ÚNICA alternativa correta.`; formattedOptions = "OPÇÕES:\n" + quizData.options.map(opt => `- "${opt.text}"`).join('\n'); break;
                case 'reorder': promptDeInstrucao = `A tarefa é: "${quizData.questionText}". Forneça a ordem correta listando os textos dos itens, um por linha, do primeiro ao último.`; formattedOptions = "Itens para ordenar:\n" + quizData.draggableItems.map(item => `- "${item.text}"`).join('\n'); break;
                case 'drag_into_blank': promptDeInstrucao = `Responda APENAS com o texto da ÚNICA opção correta que preenche a lacuna.`; formattedOptions = "Opções para arrastar:\n" + quizData.draggableOptions.map(item => `- "${item.text}"`).join('\n'); break;
                case 'open_ended': promptDeInstrucao = `Responda APENAS com a palavra ou frase curta que preenche a lacuna.`; break;
                case 'multiple_choice': promptDeInstrucao = `Responda APENAS com os textos exatos de TODAS as alternativas corretas, separando cada uma em uma NOVA LINHA.`; formattedOptions = "OPÇÕES:\n" + quizData.options.map(opt => `- "${opt.text}"`).join('\n'); break;
            }
            let textPrompt = `${promptDeInstrucao}\n\n---\nPERGUNTA: "${quizData.questionText}"\n---\n${formattedOptions}`;

            // --- 2. Processamento de Imagem ---
            let base64Image = null;
            if (quizData.questionImageUrl) {
                base64Image = await imageUrlToBase64(quizData.questionImageUrl);
            }
            const hasDraggableImages = quizData.questionType === 'match_image_to_text';

            // Verificação de Imagem do DeepSeek
            if (currentAiProvider === 'deepseek' && (base64Image || hasDraggableImages)) {
                console.warn("DeepSeek não suporta imagens. Mostrando aviso...");
                try {
                    const acaoUsuario = await mostrarAvisoDeepSeekImagem();
                    if (acaoUsuario === 'gemini') {
                        console.log("Usuário escolheu usar Gemini.");
                        currentAiProvider = 'gemini';
                        const aiToggleBtn = document.getElementById('ai-toggle-btn');
                        if (aiToggleBtn) {
                            aiToggleBtn.innerText = 'IA: Gemini';
                            aiToggleBtn.style.color = 'rgba(255, 255, 255, 0.6)';
                        }
                    } else if (acaoUsuario === 'sem_imagem') {
                        console.log("Usuário escolheu enviar para o DeepSeek sem a imagem.");
                        base64Image = null;
                        if (quizData.questionType === 'match_image_to_text') {
                            quizData.questionType = 'match_order'; // Downgrade
                            quizData.draggableItems = quizData.draggableItems.map(item => ({
                                text: item.id, // Usa "IMAGEM 1" como texto
                                element: item.element
                            }));
                            promptDeInstrucao = `Responda com os pares no formato EXATO: 'Texto do Local para Soltar -> ID da Imagem' (ex: 90° -> IMAGEM 3), com cada par em uma nova linha.`;
                            const draggables = quizData.draggableItems.map(item => `- "${item.text}"`).join('\n');
                            const droppables = quizData.dropZones.map(item => `- "${item.text}"`).join('\n');
                            formattedOptions = `Itens para Arrastar (IDs):\n${draggables}\n\nLocais para Soltar:\n${droppables}`;
                            textPrompt = `${promptDeInstrucao}\n\n---\nPERGUNTA: "${quizData.questionText}"\n---\n${formattedOptions}`;
                        }
                    }
                } catch (error) {
                    console.error(error.message);
                    throw error;
                }
            }

            // --- 3. Lógica de Fetch ---
            try {
                let aiResponseText = null;
                if (currentAiProvider === 'gemini') {
                    console.log("Usando Provedor: Gemini");
                    let geminiKeyFailed = false;
                    for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
                        const currentKey = GEMINI_API_KEYS[currentApiKeyIndex];
                        if (!currentKey || currentKey.includes("SUA_") || currentKey.length < 30) {
                            console.warn(`Chave de API Gemini #${currentApiKeyIndex + 1} parece ser um placeholder. Pulando...`);
                            currentApiKeyIndex = (currentApiKeyIndex + 1) % GEMINI_API_KEYS.length;
                            continue;
                        }
                        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${currentKey}`;

                        let promptParts = [{ text: textPrompt }];

                        if (base64Image) {
                            const [header, data] = base64Image.split(',');
                            let mimeType = header.match(/:(.*?);/)[1];
                            if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) mimeType = 'image/jpeg';
                            promptParts.push({ inline_data: { mime_type: mimeType, data: data } });
                        }

                        if (quizData.questionType === 'match_image_to_text') {
                            promptParts.push({ text: "\n\nIMAGENS (Itens para Arrastar):\n" });
                            for (const item of quizData.draggableItems) {
                                 const base64 = await imageUrlToBase64(item.imageUrl);
                                 if (base64) {
                                    const [header, data] = base64.split(',');
                                    let mimeType = header.match(/:(.*?);/)[1];
                                    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) mimeType = 'image/jpeg';
                                    promptParts.push({ inline_data: { mime_type: mimeType, data: data } });
                                    promptParts.push({ text: `- ${item.id}` }); // Envia " - IMAGEM 1"
                                 }
                            }
                        }

                        try {
                            const response = await fetchWithTimeout(API_URL, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ contents: [{ parts: promptParts }] })
                            });
                            if (response.ok) {
                                const data = await response.json();
                                aiResponseText = data.candidates[0].content.parts[0].text;
                                console.log(`Sucesso com a Chave API Gemini #${currentApiKeyIndex + 1}.`);
                                break;
                            }
                            const errorData = await response.json();
                            const errorMessage = errorData.error?.message || `Erro ${response.status}`;
                            console.warn(`Chave API Gemini #${currentApiKeyIndex + 1} falhou: ${errorMessage}. Tentando a próxima...`);
                            lastAiResponse = `Falha na Chave Gemini #${currentApiKeyIndex + 1}: ${errorMessage}`;
                        } catch (error) {
                            console.warn(`Erro na requisição com a Chave API Gemini #${currentApiKeyIndex + 1}: ${error.message}. Tentando a próxima...`);
                            lastAiResponse = `Falha na Chave Gemini #${currentApiKeyIndex + 1}: ${error.message}`;
                        }
                        currentApiKeyIndex = (currentApiKeyIndex + 1) % GEMINI_API_KEYS.length;
                        if (i === GEMINI_API_KEYS.length - 1) {
                             geminiKeyFailed = true;
                        }
                    }
                    if (!aiResponseText && geminiKeyFailed) {
                        throw new Error("Todas as chaves de API do Gemini falharam.");
                    }

                } else if (currentAiProvider === 'deepseek') {
                    console.log("Usando Provedor: DeepSeek (via OpenRouter)");
                    let deepseekKeyFailed = false;

                    for (let i = 0; i < OPENROUTER_API_KEYS.length; i++) {
                        const currentKey = OPENROUTER_API_KEYS[currentOpenRouterKeyIndex];
                        if (!currentKey || currentKey.includes("SUA_") || currentKey.length < 30) {
                            console.warn(`Chave OpenRouter #${currentOpenRouterKeyIndex + 1} parece ser um placeholder. Pulando...`);
                            currentOpenRouterKeyIndex = (currentOpenRouterKeyIndex + 1) % OPENROUTER_API_KEYS.length;
                            continue;
                        }

                        const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
                        const body = JSON.stringify({
                            model: DEEPSEEK_MODEL_NAME,
                            messages: [ { role: 'user', content: textPrompt } ],
                            max_tokens: 1024
                        });

                        try {
                            const response = await fetchWithTimeout(API_URL, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${currentKey}`,
                                    'HTTP-Referer': 'https://github.com/mzzvxm',
                                    'X-Title': 'Quizizz Bypass Script'
                                },
                                body: body
                            });

                            if (response.ok) {
                                const data = await response.json();
                                aiResponseText = data.choices[0].message.content;
                                console.log(`Sucesso com a Chave OpenRouter #${currentOpenRouterKeyIndex + 1}.`);
                                break;
                            }

                            const errorData = await response.json();
                            const errorMessage = errorData.error?.message || `Erro ${response.status}`;
                            console.warn(`Chave OpenRouter #${currentOpenRouterKeyIndex + 1} falhou: ${errorMessage}. Tentando a próxima...`);
                            lastAiResponse = `Falha na Chave OpenRouter #${currentOpenRouterKeyIndex + 1}: ${errorMessage}`;

                        } catch (error) {
                             console.warn(`Erro na requisição com a Chave OpenRouter #${currentOpenRouterKeyIndex + 1}: ${error.message}. Tentando a próxima...`);
                             lastAiResponse = `Falha na Chave OpenRouter #${currentOpenRouterKeyIndex + 1}: ${error.message}`;
                        }

                        currentOpenRouterKeyIndex = (currentOpenRouterKeyIndex + 1) % OPENROUTER_API_KEYS.length;
                        if (i === OPENROUTER_API_KEYS.length - 1) {
                            deepseekKeyFailed = true;
                        }
                    }

                    if (!aiResponseText && deepseekKeyFailed) {
                        throw new Error("Todas as chaves de API do OpenRouter falharam.");
                    }
                }

                // --- 4. Retorno ---
                console.log("Resposta bruta da IA:", aiResponseText);
                lastAiResponse = aiResponseText;
                return aiResponseText;

            } catch (error) {
                console.error(`Falha ao obter resposta da IA (${currentAiProvider}):`, error.message);
                lastAiResponse = `Erro: ${error.message}`;
                throw error;
            }
        }


        async function performAction(aiAnswerText, quizData) {
        if (!aiAnswerText) return;

        const getElementColor = (element) => {
            const style = window.getComputedStyle(element);
            const bgImage = style.backgroundImage;
            if (bgImage && bgImage.includes('gradient')) {
                const match = bgImage.match(/rgb\(\d+, \d+, \d+\)/);
                if (match) return match[0];
            }
            return style.backgroundColor || 'rgba(255, 255, 255, 0.8)';
        };

        switch (quizData.questionType) {
            case 'multi_dropdown':
                const popperSelector = '.v-popper__popper--shown';
                const answers = aiAnswerText.split('\n').map(line => {
                    const match = line.match(/\[RESPOSTA (\d+)\]:\s*(.*)/i);
                    if (!match) return null;
                    return {
                        index: parseInt(match[1], 10) - 1,
                        answer: match[2].trim().replace(/["'`]/g, '')
                    };
                }).filter(Boolean);

                const answersMap = new Map(answers.map(a => [a.index, a.answer]));
                const placeholderText = 'Selecionar resposta';

                // Fase 1: Limpeza
                console.log("FASE 1: Limpando dropdowns com respostas erradas ou desnecessárias...");
                for (let i = 0; i < quizData.dropdowns.length; i++) {
                    const dd = quizData.dropdowns[i];
                    const currentButtonText = dd.button.innerText.trim();
                    const targetAnswer = answersMap.get(i);

                    const isFilled = currentButtonText !== placeholderText;
                    const hasTarget = !!targetAnswer;
                    const isWrong = isFilled && hasTarget && currentButtonText !== targetAnswer;
                    const isUnnecessary = isFilled && !hasTarget;

                    if (isWrong || isUnnecessary) {
                        console.log(`Limpando Dropdown #${i + 1} (estava com "${currentButtonText}")...`);
                        dd.button.click();
                        try {
                            const optionElements = await waitForElement(`${popperSelector} button.dropdown-option`, true, 2000);
                            const selectedOption = Array.from(optionElements).find(el => el.innerText.trim() === currentButtonText);
                            if (selectedOption) {
                                selectedOption.click();
                            } else {
                                document.body.click();
                            }
                            await waitForElementToDisappear(popperSelector, 2000);
                        } catch (e) {
                            console.error(`Erro ao tentar limpar Dropdown #${i + 1}: ${e.message}`);
                            if (document.querySelector(popperSelector)) {
                                document.body.click();
                                try { await waitForElementToDisappear(popperSelector, 2000); } catch (err) {}
                            }
                        }
                    }
                }

                // Fase 2: Preenchimento
                console.log("FASE 2: Preenchendo respostas corretas da IA...");
                for (const res of answers) {
                    const dd = quizData.dropdowns[res.index];
                    if (!dd) {
                        console.error(`Dropdown com índice ${res.index} não encontrado.`);
                        continue;
                    }
                    const currentButtonText = dd.button.innerText.trim();
                    if (currentButtonText === res.answer) {
                        continue;
                    }
                    dd.button.click();
                    try {
                        const optionElements = await waitForElement(`${popperSelector} button.dropdown-option`, true, 2000);
                        const targetOption = Array.from(optionElements).find(el => el.innerText.trim() === res.answer);
                        if (targetOption) {
                            if (targetOption.disabled || targetOption.classList.contains('used-option')) {
                                console.warn(`Opção "${res.answer}" para Dropdown #${res.index + 1} ainda está desabilitada.`);
                                document.body.click();
                            } else {
                                targetOption.click();
                            }
                        } else {
                            console.error(`Opção "${res.answer}" não encontrada no Dropdown #${res.index + 1}. (A IA pode ter alucinado)`);
                            document.body.click();
                        }
                        await waitForElementToDisappear(popperSelector, 2000);
                    } catch (e) {
                        console.error(`Erro ao tentar selecionar para o dropdown #${res.index + 1}: ${e.message}`);
                        if (document.querySelector(popperSelector)) {
                            document.body.click();
                            try { await waitForElementToDisappear(popperSelector, 2000); } catch (err) {}
                        }
                    }
                }
                break;

            case 'multi_drag_into_blank':
                const highlightColors = ['#FFD700', '#00FFFF', '#FF00FF', '#7FFF00', '#FF8C00', '#DA70D6'];
                let colorIndex = 0;
                const cleanPairPartMulti = (str) => str.replace(/[`"']/g, '').trim();
                const pairingsMulti = aiAnswerText.split('\n').filter(line => line.includes('->')).map(line => {
                    const parts = line.split('->');
                    return parts.length === 2 ? [cleanPairPartMulti(parts[0]), cleanPairPartMulti(parts[1])] : null;
                }).filter(Boolean);
                if (pairingsMulti.length === 0) { console.error("Não foi possível extrair pares válidos da resposta da IA."); return; }
                const draggableMap = new Map(quizData.draggableOptions.map(i => [i.text, i.element]));
                const dropZoneMap = new Map(quizData.dropZones.map(i => [i.prompt, i.blankElement]));
                for (const [promptText, optionText] of pairingsMulti) {
                    const bestPromptMatch = [...dropZoneMap.keys()].find(key => key.includes(promptText) || promptText.includes(key));
                    const blankEl = dropZoneMap.get(bestPromptMatch);
                    const optionEl = draggableMap.get(optionText);
                    if (blankEl && optionEl) {
                        const color = highlightColors[colorIndex % highlightColors.length];
                        const highlightStyle = `box-shadow: 0 0 15px 5px ${color}; border-radius: 4px;`;
                        blankEl.style.cssText = highlightStyle;
                        optionEl.style.cssText = highlightStyle;
                        colorIndex++;
                    } else {
                        console.warn(`Par não encontrado no DOM: "${promptText}" -> "${optionText}"`);
                    }
                }
                break;

            case 'equation':
                const KEYPAD_MAP = {
                    '0': 'icon-fas-0', '1': 'icon-fas-1', '2': 'icon-fas-2', '3': 'icon-fas-3', '4': 'icon-fas-4',
                    '5': 'icon-fas-5', '6': 'icon-fas-6', '7': 'icon-fas-7', '8': 'icon-fas-8', '9': 'icon-fas-9',
                    '+': 'icon-fas-plus', '-': 'icon-fas-minus', '*': 'icon-fas-times', '×': 'icon-fas-times',
                    '/': 'icon-fas-divide', '÷': 'icon-fas-divide', '=': 'icon-fas-equals', '.': 'icon-fas-period',
                    '<': 'icon-fas-less-than', '>': 'icon-fas-greater-than',
                    '≤': 'icon-fas-less-than-equal', '≥': 'icon-fas-greater-than-equal',
                    'x': 'icon-fas-variable', 'y': 'icon-fas-variable', 'z': 'icon-fas-variable',
                    '(': 'icon-fas-brackets-round', ')': 'icon-fas-brackets-round',
                    'π': 'icon-fas-pi', 'e': 'icon-fas-euler',
                };
                let answerSequence = aiAnswerText.trim().replace(/\s/g, '').replace(/<=/g, '≤').replace(/>=/g, '≥');
                console.log(`Digitando a resposta: ${answerSequence}`);
                const editor = document.querySelector('div[data-cy="equation-editor"]');
                if (editor) {
                    editor.click();
                    await new Promise(r => setTimeout(r, 100));
                } else {
                    console.error("Não foi possível encontrar o editor de equação para focar.");
                    return;
                }
                for (const char of answerSequence) {
                    const iconClass = KEYPAD_MAP[char.toLowerCase()];
                    if (iconClass) {
                        const keyElement = document.querySelector(`.editor-button i.${iconClass}`);
                        if (keyElement) {
                            const button = keyElement.closest('button');
                            if (button) {
                                button.click();
                                await new Promise(r => setTimeout(r, 100));
                            }
                        } else {
                            console.error(`Não foi possível encontrar a tecla para o caractere: "${char}" (ícone: ${iconClass})`);
                        }
                    } else {
                        console.error(`Caractere não mapeado no teclado: "${char}"`);
                    }
                }
                break;

            case 'reorder':
                const cleanText = (str) => str.replace(/["'`]/g, '').trim();
                const orderedItems = aiAnswerText.split('\n').map(cleanText).filter(Boolean);
                const draggablesMapReorder = new Map(quizData.draggableItems.map(i => [i.text, i.element]));
                const dropZonesInOrder = quizData.dropZones;
                if (orderedItems.length === dropZonesInOrder.length) {
                    for (let i = 0; i < orderedItems.length; i++) {
                        const sourceText = orderedItems[i];
                        const sourceEl = draggablesMapReorder.get(sourceText);
                        const destinationEl = dropZonesInOrder[i].element;
                        if (sourceEl && destinationEl) {
                            const color = getElementColor(sourceEl);
                            const highlightStyle = `box-shadow: 0 0 15px 5px ${color}; border-radius: 8px;`;
                            sourceEl.style.cssText = highlightStyle;
                            destinationEl.style.cssText = highlightStyle;
                        }
                    }
                }
                break;

            case 'drag_into_blank':
                const cleanAiAnswerBlank = aiAnswerText.trim().replace(/["'`]/g, '');
                const targetOption = quizData.draggableOptions.find(opt => opt.text === cleanAiAnswerBlank);
                if (targetOption) {
                    const color = getElementColor(targetOption.element);
                    const highlightStyle = `box-shadow: 0 0 15px 5px ${color}`;
                    targetOption.element.style.cssText = highlightStyle;
                    quizData.dropZone.element.style.cssText = highlightStyle;
                }
                break;

            case 'match_image_to_text':
                const highlightColorsImg = ['#FFD700', '#00FFFF', '#FF00FF', '#7FFF00', '#FF8C00', '#DA70D6'];
                let colorIndexImg = 0;

                const cleanPairPartImg = (str) => str.replace(/[`"\[\]]/g, '').trim();

                const pairingsImg = aiAnswerText.split('\n').filter(line => line.includes('->')).map(line => {
                    const parts = line.split('->');
                    return parts.length === 2 ? [cleanPairPartImg(parts[0]), cleanPairPartImg(parts[1])] : null;
                }).filter(Boolean);

                if (pairingsImg.length === 0) { console.error("Não foi possível extrair pares válidos (Texto -> ID Imagem) da resposta da IA."); return; }

                const draggablesMapImg = new Map(quizData.draggableItems.map(i => [i.id, i.element]));
                const dropZonesMapImg = new Map(quizData.dropZones.map(i => [i.text, i.element]));

                for (const [partA, partB] of pairingsImg) {
                    let sourceEl, destinationEl;
                    if (dropZonesMapImg.has(partA) && draggablesMapImg.has(partB)) {
                        destinationEl = dropZonesMapImg.get(partA);
                        sourceEl = draggablesMapImg.get(partB);
                    } else if (dropZonesMapImg.has(partB) && draggablesMapImg.has(partA)) {
                        destinationEl = dropZonesMapImg.get(partB);
                        sourceEl = draggablesMapImg.get(partA);
                    } else {
                        console.warn(`Par não mapeado: "${partA}" (existe? ${dropZonesMapImg.has(partA)}) -> "${partB}" (existe? ${draggablesMapImg.has(partB)})`);
                        continue;
                    }

                    if (sourceEl && destinationEl) {
                        const color = highlightColorsImg[colorIndexImg % highlightColorsImg.length];
                        const highlightStyle = `box-shadow: 0 0 15px 5px ${color}; border-radius: 8px;`;
                        sourceEl.style.cssText = highlightStyle;
                        destinationEl.style.cssText = highlightStyle;
                        colorIndexImg++;
                    }
                }
                break;

            case 'match_order':
                const cleanPairPart = (str) => str.replace(/["'`]/g, '').trim();
                const pairings = aiAnswerText.split('\n').filter(line => line.includes('->')).map(line => {
                    const parts = line.split('->');
                    return parts.length === 2 ? [cleanPairPart(parts[0]), cleanPairPart(parts[1])] : null;
                }).filter(Boolean);
                if (pairings.length === 0) { console.error("Não foi possível extrair pares válidos da resposta da IA."); return; }
                const draggablesMapMatch = new Map(quizData.draggableItems.map(i => [i.text, i.element]));
                const dropZonesMap = new Map(quizData.dropZones.map(i => [i.text, i.element]));
                for (const [partA, partB] of pairings) {
                    let sourceEl, destinationEl;
                    if (dropZonesMap.has(partA) && draggablesMapMatch.has(partB)) {
                        destinationEl = dropZonesMap.get(partA);
                        sourceEl = draggablesMapMatch.get(partB);
                    } else if (dropZonesMap.has(partB) && draggablesMapMatch.has(partA)) {
                        destinationEl = dropZonesMap.get(partB);
                        sourceEl = draggablesMapMatch.get(partA);
                    } else { continue; }
                    if (sourceEl && destinationEl) {
                        const color = getElementColor(sourceEl);
                        const highlightStyle = `box-shadow: 0 0 15px 5px ${color}; border-radius: 8px;`;
                        sourceEl.style.cssText = highlightStyle;
                        destinationEl.style.cssText = highlightStyle;
                    }
                }
                break;

            default:
                const normalize = (str) => {
                    if (typeof str !== 'string') return '';
                    let cleaned = str.replace(/[^a-zA-Z\u00C0-\u017F0-9\s²³]/g, '').replace(/\s+/g, ' ');
                    return cleaned.trim().toLowerCase();
                };

                if (quizData.questionType === 'open_ended') {
                    await new Promise(resolve => {
                        quizData.answerElement.focus();
                        quizData.answerElement.value = aiAnswerText.trim();
                        quizData.answerElement.dispatchEvent(new Event('input', { bubbles: true }));
                        setTimeout(resolve, 100);
                    });
                    setTimeout(() => document.querySelector('.submit-button-wrapper button, button.submit-btn')?.click(), 500);
                } else if (quizData.questionType === 'multiple_choice') {
                    const aiAnswers = aiAnswerText.split('\n').map(normalize).filter(Boolean);
                    quizData.options.forEach(opt => {
                        if (aiAnswers.includes(normalize(opt.text))) {
                            opt.element.style.border = '5px solid #FFFFFF';
                            opt.element.click();
                        }
                    });
                } else if (quizData.questionType === 'single_choice') {
                    const normalizedAiAnswer = normalize(aiAnswerText);
                    const bestMatch = quizData.options.find(opt => {
                        const normalizedOption = normalize(opt.text);
                        return normalizedOption === normalizedAiAnswer;
                    });

                    if (bestMatch) {
                        console.log("Correspondência encontrada!", bestMatch.element);
                        bestMatch.element.style.border = '5px solid #FFFFFF';
                        bestMatch.element.click();
                    } else {
                        console.warn("Nenhuma correspondência exata encontrada após normalização.");
                    }
                }
                break;
        }
    }

        async function resolverQuestao() {
        const button = document.getElementById('ai-solver-button');
        button.disabled = true;
        button.innerText = "👨‍💻";
        button.style.transform = 'scale(0.95)';
        button.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
        try {
            const quizData = await extrairDadosDaQuestao();
            if (!quizData) {
                alert("Não foi possível extrair os dados da questão.");
                return;
            }

            if (quizData.questionType === 'multi_dropdown') {
                 console.log("Usando IA para resolver múltiplos dropdowns (lógica de pool)...");
                 const aiAnswer = await obterRespostaDaIA(quizData);
                 if (aiAnswer) {
                     await performAction(aiAnswer, quizData);
                 }
            } else if (quizData.questionType === 'dropdown') {
                console.log("Iniciando fluxo otimizado para Dropdown...");
                quizData.dropdownButton.click();
                try {
                    const optionElements = await waitForElement('.v-popper__popper--shown button.dropdown-option', true);
                    quizData.options = Array.from(optionElements).map(el => ({ text: el.innerText.trim() }));
                    const aiAnswer = await obterRespostaDaIA(quizData);
                    if (aiAnswer) {
                        const cleanAiAnswerDrop = aiAnswer.trim().replace(/["'`]/g, '');
                        const targetOptionDrop = Array.from(optionElements).find(el => el.innerText.trim() === cleanAiAnswerDrop);
                        if (targetOptionDrop) {
                            targetOptionDrop.click();
                        } else {
                            console.error(`Não foi possível encontrar a opção dropdown com o texto: "${cleanAiAnswerDrop}"`);
                            document.body.click();
                        }
                    } else {
                         document.body.click();
                    }
                } catch (error) {
                    console.error("Falha ao processar o dropdown:", error.message);
                    document.body.click();
                }
            } else {
                const isMath = quizData.options && quizData.options.length > 0 && (quizData.options[0].text.includes('\\') || quizData.questionText.toLowerCase().includes('value of'));
                const matchValue = quizData.questionText.match(/value of ([\d.]+)/i);
                if (isMath && matchValue) {
                    console.log("Questão de matemática detectada. Resolvendo localmente...");
                    const targetValue = parseFloat(matchValue[1]);
                    quizData.options.forEach(option => {
                        const computableExpr = (() => {
                            let c = option.text.replace(/\\left/g, '').replace(/\\right/g, '').replace(/\\div/g, '/').replace(/\\times/g, '*').replace(/\\ /g, '').replace(/(\d+)\s*\(/g, '$1 * (').replace(/\)\s*(\d+)/g, ') * $1');
                            c = c.replace(/(\d+)\\frac\{(\d+)\}\{(\d+)\}/g, '($1+$2/$3)');
                            c = c.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '($1/$2)');
                            return c;
                        })();
                        const result = (() => { try { return new Function('return ' + computableExpr)(); } catch (e) { return null; } })();
                        if (result !== null && Math.abs(result - targetValue) < 0.001) {
                            option.element.style.border = '5px solid #FFFFFF';
                            option.element.click();
                        }
                    });
                } else {
                    console.log("Usando IA para resolver...");
                    const aiAnswer = await obterRespostaDaIA(quizData);
                    if (aiAnswer) {
                        await performAction(aiAnswer, quizData);
                    }
                }
            }
        } catch (error) {
            console.error("Um erro inesperado ocorreu no fluxo principal:", error);
            if (error.message && !error.message.includes("Ação cancelada")) {
                alert("Ocorreu um erro: " + error.message);
            }
        } finally {
            const viewResponseBtn = document.getElementById('view-raw-response-btn');
            if (viewResponseBtn && lastAiResponse) {
                viewResponseBtn.style.display = 'block';
            }
            button.disabled = false;
            button.innerText = "Puxar Resposta";
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        }
    }

        // --- LÓGICA DA UI ---

        function mostrarAvisoDeepSeekImagem() {
            return new Promise((resolve, reject) => {
                const oldModal = document.getElementById('deepseek-warning-modal');
                if (oldModal) oldModal.remove();

                const overlay = document.createElement('div');
                overlay.id = 'deepseek-warning-modal';
                Object.assign(overlay.style, {
                    position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: '2147483648',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'opacity 0.2s ease', opacity: '0'
                });

                const modalContainer = document.createElement('div');
                Object.assign(modalContainer.style, {
                    background: 'rgba(26, 27, 30, 0.9)', backdropFilter: 'blur(10px)',
                    padding: '24px', borderRadius: '16px', color: 'white',
                    fontFamily: 'system-ui, sans-serif', maxWidth: '400px',
                    textAlign: 'center', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                });

                const title = document.createElement('h3');
                title.innerText = '⚠️ DeepSeek Não Vê Imagens';
                Object.assign(title.style, {
                    margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600'
                });

                const message = document.createElement('p');
                message.innerText = 'Esta pergunta contém uma ou mais imagens que o DeepSeek não pode processar. O que você deseja fazer?';
                Object.assign(message.style, {
                    margin: '0 0 20px 0', fontSize: '14px', lineHeight: '1.5',
                    color: 'rgba(255, 255, 255, 0.8)'
                });

                const buttonContainer = document.createElement('div');
                Object.assign(buttonContainer.style, {
                    display: 'flex', flexDirection: 'column', gap: '10px'
                });

                const closeModal = () => {
                    overlay.style.opacity = '0';
                    setTimeout(() => overlay.remove(), 200);
                };

                const btnGemini = document.createElement('button');
                btnGemini.innerText = 'Usar a Gemini (Recomendado)';
                Object.assign(btnGemini.style, {
                    background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                    border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer',
                    fontSize: '14px', fontWeight: '500', padding: '12px',
                    transition: 'all 0.2s ease'
                });
                btnGemini.onmouseover = () => btnGemini.style.opacity = '0.9';
                btnGemini.onmouseout = () => btnGemini.style.opacity = '1';
                btnGemini.onclick = () => {
                    closeModal();
                    resolve('gemini');
                };

                const btnNoImage = document.createElement('button');
                btnNoImage.innerText = 'Responder sem enviar Imagem';
                Object.assign(btnNoImage.style, {
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px', color: 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                    padding: '12px', transition: 'all 0.2s ease'
                });
                btnNoImage.onmouseover = () => btnNoImage.style.background = 'rgba(255, 255, 255, 0.15)';
                btnNoImage.onmouseout = () => btnNoImage.style.background = 'rgba(255, 255, 255, 0.1)';
                btnNoImage.onclick = () => {
                    closeModal();
                    resolve('sem_imagem');
                };

                overlay.onclick = (e) => {
                    if (e.target === overlay) {
                        closeModal();
                        reject(new Error('Ação cancelada.'));
                    }
                };

                buttonContainer.appendChild(btnGemini);
                buttonContainer.appendChild(btnNoImage);
                modalContainer.appendChild(title);
                modalContainer.appendChild(message);
                modalContainer.appendChild(buttonContainer);
                overlay.appendChild(modalContainer);
                document.body.appendChild(overlay);

                setTimeout(() => overlay.style.opacity = '1', 10);
            });
        }

        function makeDraggable(panel, handle) {
            let offsetX = 0, offsetY = 0, isDragging = false;

            handle.addEventListener('mousedown', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.closest('a')) return;

                isDragging = true;
                const rect = panel.getBoundingClientRect();

                if (panel.style.bottom || panel.style.right) {
                    panel.style.right = 'auto';
                    panel.style.bottom = 'auto';
                    panel.style.top = rect.top + 'px';
                    panel.style.left = rect.left + 'px';
                }

                offsetX = e.clientX - panel.getBoundingClientRect().left;
                offsetY = e.clientY - panel.getBoundingClientRect().top;

                panel.style.transition = 'none';
                handle.style.cursor = 'grabbing';
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;

                let newX = e.clientX - offsetX;
                let newY = e.clientY - offsetY;

                newX = Math.max(0, Math.min(newX, window.innerWidth - panel.offsetWidth));
                newY = Math.max(0, Math.min(newY, window.innerHeight - panel.offsetHeight));

                panel.style.top = newY + 'px';
                panel.style.left = newX + 'px';
            });

            document.addEventListener('mouseup', () => {
                if (!isDragging) return;
                isDragging = false;
                panel.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
                handle.style.cursor = 'grab';
            });

            handle.addEventListener('touchstart', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.closest('a')) return;

                isDragging = true;
                const rect = panel.getBoundingClientRect();
                const touch = e.touches[0];

                if (panel.style.bottom || panel.style.right) {
                    panel.style.right = 'auto';
                    panel.style.bottom = 'auto';
                    panel.style.top = rect.top + 'px';
                    panel.style.left = rect.left + 'px';
                }

                offsetX = touch.clientX - panel.getBoundingClientRect().left;
                offsetY = touch.clientY - panel.getBoundingClientRect().top;

                panel.style.transition = 'none';
                e.preventDefault();
            });

            document.addEventListener('touchmove', (e) => {
                if (!isDragging) return;

                const touch = e.touches[0];
                let newX = touch.clientX - offsetX;
                let newY = touch.clientY - offsetY;

                newX = Math.max(0, Math.min(newX, window.innerWidth - panel.offsetWidth));
                newY = Math.max(0, Math.min(newY, window.innerHeight - panel.offsetHeight));

                panel.style.top = newY + 'px';
                panel.style.left = newX + 'px';
                e.preventDefault();
            });

            document.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;
                panel.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
            });
        }

        function criarFloatingPanel() {
            if (document.getElementById('mlk-mau-floating-panel')) return;
            
            const panel = document.createElement('div');
            panel.id = 'mlk-mau-floating-panel';
            Object.assign(panel.style, {
                position: 'fixed', 
                bottom: '60px', 
                right: '20px', 
                zIndex: '2147483647',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'stretch',
                gap: '10px', 
                padding: '12px', 
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(8px)', 
                webkitBackdropFilter: 'blur(8px)', 
                borderRadius: '16px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
                transform: 'translateY(0)',
                opacity: '1',
                cursor: 'grab',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            });

            const responseViewer = document.createElement('div');
            responseViewer.id = 'ai-response-viewer';
            Object.assign(responseViewer.style, {
                display: 'none', 
                position: 'absolute', 
                bottom: 'calc(100% + 10px)', 
                right: '0',
                width: '300px', 
                maxHeight: '200px', 
                overflowY: 'auto',
                background: 'rgba(10, 10, 15, 0.95)', 
                backdropFilter: 'blur(5px)',
                borderRadius: '8px', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '12px', 
                color: '#f0f0f0', 
                fontSize: '12px',
                fontFamily: 'monospace', 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-all',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                textAlign: 'left'
            });
            panel.appendChild(responseViewer);

            const viewResponseBtn = document.createElement('button');
            viewResponseBtn.id = 'view-raw-response-btn';
            Object.assign(viewResponseBtn.style, {
                background: 'none', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'rgba(255, 255, 255, 0.6)', 
                cursor: 'pointer',
                fontSize: '11px', 
                padding: '4px 8px', 
                borderRadius: '6px',
                display: 'none', 
                transition: 'all 0.2s ease',
                marginBottom: '4px'
            });
            viewResponseBtn.innerText = 'Ultimada Resposta Obtida';
            viewResponseBtn.addEventListener('click', () => {
                if (responseViewer.style.display === 'block') {
                    responseViewer.style.display = 'none';
                } else {
                    responseViewer.innerText = lastAiResponse || "Nenhuma resposta da IA foi recebida ainda.";
                    responseViewer.style.display = 'block';
                }
            });
            panel.appendChild(viewResponseBtn);

            // --- CONTROLES ---
            const controlsContainer = document.createElement('div');
            Object.assign(controlsContainer.style, {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
            });

            // Botão Minimizar
            const minimizeBtn = document.createElement('button');
            minimizeBtn.id = 'minimize-btn';
            minimizeBtn.innerHTML = '−';
            Object.assign(minimizeBtn.style, {
                background: 'none',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0',
                transition: 'all 0.2s ease'
            });

            minimizeBtn.addEventListener('mouseover', () => {
                minimizeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });

            minimizeBtn.addEventListener('mouseout', () => {
                minimizeBtn.style.backgroundColor = 'transparent';
            });

            // Botão Fechar
            const closeBtn = document.createElement('button');
            closeBtn.id = 'close-btn';
            closeBtn.innerHTML = '×';
            Object.assign(closeBtn.style, {
                background: 'none',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0',
                transition: 'all 0.2s ease'
            });

            closeBtn.addEventListener('mouseover', () => {
                closeBtn.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            });

            closeBtn.addEventListener('mouseout', () => {
                closeBtn.style.backgroundColor = 'transparent';
            });

            closeBtn.addEventListener('click', () => {
                panel.remove();
            });

            controlsContainer.appendChild(minimizeBtn);
            controlsContainer.appendChild(closeBtn);
            panel.appendChild(controlsContainer);

            // --- BOTÃO DE ALTERNÂNCIA DE IA (APENAS SE HOUVER MAIS DE UM PROVEDOR) ---
            const availableProviders = getAvailableProviders();
            
            if (availableProviders.length > 1) {
                // Frame acima do botão de IA
                const aiInstruction = document.createElement('div');
                aiInstruction.innerHTML = 'Escolha abaixo a IA que você configurou.';
                Object.assign(aiInstruction.style, {
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '11px',
                    textAlign: 'center',
                    marginBottom: '4px',
                    fontStyle: 'italic'
                });
                panel.appendChild(aiInstruction);

                // Botão de alternância
                const aiToggleBtn = document.createElement('button');
                aiToggleBtn.id = 'ai-toggle-btn';
                aiToggleBtn.innerText = `IA: ${currentAiProvider === 'gemini' ? 'Gemini' : 'DeepSeek'}`;
                Object.assign(aiToggleBtn.style, {
                    background: 'none', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'rgba(255, 255, 255, 0.6)', 
                    cursor: 'pointer',
                    fontSize: '11px', 
                    padding: '4px 8px', 
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    marginBottom: '4px'
                });
                
                aiToggleBtn.addEventListener('click', () => {
                    const availableProviders = getAvailableProviders();
                    if (availableProviders.length > 1) {
                        // Alternar entre os provedores disponíveis
                        const currentIndex = availableProviders.indexOf(currentAiProvider);
                        const nextIndex = (currentIndex + 1) % availableProviders.length;
                        currentAiProvider = availableProviders[nextIndex];
                        
                        aiToggleBtn.innerText = `IA: ${currentAiProvider === 'gemini' ? 'Gemini' : 'DeepSeek'}`;
                        aiToggleBtn.style.color = currentAiProvider === 'gemini' ? 'rgba(255, 255, 255, 0.6)' : '#a78bfa';
                        
                        console.log(`Provedor de IA alterado para: ${currentAiProvider}`);
                    }
                });
                
                // Definir cor inicial baseada no provedor atual
                aiToggleBtn.style.color = currentAiProvider === 'gemini' ? 'rgba(255, 255, 255, 0.6)' : '#a78bfa';
                panel.appendChild(aiToggleBtn);
            } else if (availableProviders.length === 1) {
                // Apenas um provedor disponível - mostrar indicador fixo
                const aiIndicator = document.createElement('div');
                aiIndicator.innerHTML = `IA: ${availableProviders[0] === 'gemini' ? 'Gemini' : 'DeepSeek'}`;
                Object.assign(aiIndicator.style, {
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '11px',
                    textAlign: 'center',
                    marginBottom: '4px',
                    fontStyle: 'italic'
                });
                panel.appendChild(aiIndicator);
            }

            // --- BOTÃO PRINCIPAL DE RESOLVER QUESTÃO ---
            const button = document.createElement('button');
            button.id = 'ai-solver-button';
            button.innerHTML = 'Puxar Resposta';
            Object.assign(button.style, {
                background: 'linear-gradient(90deg, #cc0000, #cc6600, #cccc00, #00cc00, #00cccc, #0000cc, #6600cc, #cc00cc, #cc0000)',
                backgroundSize: '400% 400%',
                border: 'none', 
                borderRadius: '10px', 
                color: 'white', 
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif', 
                fontSize: '15px', 
                fontWeight: '600',
                padding: '10px 20px', 
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease', 
                letterSpacing: '0.5px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                animation: 'rgbFlow 3s linear infinite'
            });

            // Adicionar animação RGB
            const style = document.createElement('style');
            style.textContent = `
                @keyframes rgbFlow {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 400% 50%; }
                }
            `;
            document.head.appendChild(style);

            button.addEventListener('mouseover', () => { 
                button.style.transform = 'translateY(-2px)'; 
                button.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.3)'; 
            });
            button.addEventListener('mouseout', () => { 
                button.style.transform = 'translateY(0)'; 
                button.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)'; 
            });
            button.addEventListener('mousedown', () => { 
                button.style.transform = 'translateY(1px)'; 
                button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.15)'; 
            });
            button.addEventListener('mouseup', () => { 
                button.style.transform = 'translateY(-2px)'; 
                button.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.3)'; 
            });
            button.addEventListener('click', resolverQuestao);
            panel.appendChild(button);

            const watermark = document.createElement('div');
            watermark.id = 'mlk-mau-watermark';
            watermark.innerHTML = `
                <div style="display: flex; gap: 8px; align-items: center; color: rgba(255,255,255,0.7); margin-top: 8px; justify-content: flex-end;">
                    <span style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; font-weight: 400;">MLK MAU</span>
                </div>
            `;
            panel.appendChild(watermark);
            document.body.appendChild(panel);

            // --- LÓGICA DE MINIMIZAR ---
            const contentToToggle = [
                'view-raw-response-btn',
                'ai-toggle-btn',
                'ai-solver-button',
                'mlk-mau-watermark'
            ];

            // Adicionar elementos específicos baseados nos provedores disponíveis
            if (availableProviders.length > 1) {
                contentToToggle.push('ai-toggle-btn');
            }

            let isMinimized = false;

            minimizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                isMinimized = !isMinimized;
                
                if (isMinimized) {
                    minimizeBtn.innerHTML = '+';
                    contentToToggle.forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.style.display = 'none';
                    });
                    panel.style.padding = '8px';
                    panel.style.gap = '5px';
                    responseViewer.style.display = 'none';
                } else {
                    minimizeBtn.innerHTML = '−';
                    contentToToggle.forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.style.display = '';
                    });
                    panel.style.padding = '12px';
                    panel.style.gap = '10px';
                    if (!lastAiResponse) {
                        document.getElementById('view-raw-response-btn').style.display = 'none';
                    }
                }
            });

            // --- LÓGICA DE ARRASTAR (CORREÇÃO: SEMPRE ARRASTÁVEL) ---
            makeDraggable(panel, panel);

            console.log("Floating Panel MLK MAU criado com sucesso!");
        }

        // --- LÓGICA DE DETECÇÃO DE QUIZ ID ---

        function logQuizId(id, source) {
            if (id === quizIdDetected) {
                return;
            }
            quizIdDetected = id;
            console.log(`[Quizizz Bypass] Novo Quiz ID detectado (${source}): %c${id}`, "color: #00FF00; font-weight: bold;");
        }

        function detectQuizIdFromURL() {
            const match = window.location.pathname.match(regexQuizId);
            return match ? match[1] : null;
        }

        function interceptFetch() {
            const originalFetch = window.fetch;
            window.fetch = async function (...args) {
                const [resource] = args;
                if (typeof resource === 'string') {
                    const match = resource.match(regexQuizId);
                    if (match) {
                        const id = match[1];
                        logQuizId(id, "fetch");
                    }
                }
                return originalFetch.apply(this, args);
            };
        }

        function interceptXHR() {
            const originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function (method, url) {
                if (typeof url === 'string') {
                    const match = url.match(regexQuizId);
                    if (match) {
                        const id = match[1];
                        logQuizId(id, "XHR");
                    }
                }
                return originalOpen.apply(this, arguments);
            };
        }

        function initQuizIdDetector() {
            console.log("[Quizizz Bypass] Detector de Quiz ID carregado.");
            const id = detectQuizIdFromURL();
            if (id) {
                logQuizId(id, "URL");
            }

            if (!interceptorsStarted) {
                console.log("[Quizizz Bypass] Iniciando interceptadores de rede (fetch/XHR).");
                interceptFetch();
                interceptXHR();
                interceptorsStarted = true;
            }
        }

        (function monitorSPA() {
            const pushState = history.pushState;
            history.pushState = function () {
                const result = pushState.apply(this, arguments);
                setTimeout(initQuizIdDetector, 300);
                return result;
            };
            window.addEventListener("popstate", () => setTimeout(initQuizIdDetector, 300));
        })();

        // --- FIM DA LÓGICA DE DETECÇÃO DE QUIZ ID ---

        async function fetchWithTimeout(resource, options = {}, timeout = 15000) {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            try {
                const response = await fetch(resource, { ...options, signal: controller.signal });
                clearTimeout(id);
                return response;
            } catch (error) {
                clearTimeout(id);
                if (error.name === 'AbortError') throw new Error('A requisição demorou muito e foi cancelada (Timeout).');
                throw error;
            }
        }

        async function imageUrlToBase64(url) {
            try {
                const cacheBustUrl = new URL(url);
                cacheBustUrl.searchParams.set('_t', new Date().getTime());

                const r = await fetchWithTimeout(cacheBustUrl.href, { cache: 'no-store' });
                const b = await r.blob();
                return new Promise((res, rej) => {
                    const reader = new FileReader();
                    reader.onloadend = () => res(reader.result);
                    reader.onerror = (e) => {
                        console.error("Erro no FileReader:", e);
                        rej(e);
                    };
                    reader.readAsDataURL(b);
                });
            } catch (e) {
                console.error(`Erro ao converter imagem: ${e.message}`, url);
                return null;
            }
        }

        // --- Start ---
        criarFloatingPanel();
        initQuizIdDetector();
    }

    // -----------------------------------------------------------------------------------
    // INICIAR A SCRIPT
    // -----------------------------------------------------------------------------------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeScript);
    } else {
        initializeScript();
    }

})();