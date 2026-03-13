const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Criar pasta screenshots se não existir
const screenshotsDir = path.join(__dirname, '../docs/screenshots');
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function captureScreenshots() {
    console.log('🚀 Iniciando captura de screenshots...');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    // MOBILE VIEWPORT (iPhone 14 Pro)
    await page.setViewport({ width: 390, height: 844 });

    // Login credentials (ADMIN)
    const baseURL = 'https://puntotouch.nextim.io';
    const email = 'ADMIN';
    const password = 'admin123';

    try {
        // Desativar tutorial em todas as páginas
        await page.evaluateOnNewDocument(() => {
            localStorage.setItem('tutorialCompleted', 'true');
        });

        // 1. LOGIN
        console.log('📸 Capturando: Login...');
        await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle0', timeout: 60000 });
        await page.screenshot({
            path: path.join(screenshotsDir, '01-login.png'),
            fullPage: true
        });

        // Fazer login com selectors corretos
        await page.waitForSelector('#passport', { visible: true, timeout: 10000 });
        await page.type('#passport', email);
        await page.waitForSelector('#password', { visible: true });
        await page.type('#password', password);
        await page.waitForSelector('button[type="submit"]', { visible: true });
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });

        // 2. DASHBOARD
        console.log('📸 Capturando: Dashboard...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Fechar modal do tutorial se existir
        await page.evaluate(() => {
            const closeBtn = document.querySelector('.swal2-close, button[aria-label="Close"]');
            if (closeBtn) closeBtn.click();
        });
        await new Promise(resolve => setTimeout(resolve, 500));

        await page.screenshot({
            path: path.join(screenshotsDir, '02-dashboard.png'),
            fullPage: true
        });

        // 3. OBRAS
        console.log('📸 Capturando: Obras...');
        await page.goto(`${baseURL}/projects`, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.evaluate(() => {
            const closeBtn = document.querySelector('.swal2-close, button[aria-label="Close"]');
            if (closeBtn) closeBtn.click();
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        await page.screenshot({
            path: path.join(screenshotsDir, '03-obras.png'),
            fullPage: true
        });

        // 4. CLIENTES
        console.log('📸 Capturando: Clientes...');
        await page.goto(`${baseURL}/clients`, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.evaluate(() => {
            const closeBtn = document.querySelector('.swal2-close, button[aria-label="Close"]');
            if (closeBtn) closeBtn.click();
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        await page.screenshot({
            path: path.join(screenshotsDir, '04-clientes.png'),
            fullPage: true
        });

        // 5. FUNCIONÁRIOS
        console.log('📸 Capturando: Funcionários...');
        await page.goto(`${baseURL}/employees`, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.evaluate(() => {
            const closeBtn = document.querySelector('.swal2-close, button[aria-label="Close"]');
            if (closeBtn) closeBtn.click();
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        await page.screenshot({
            path: path.join(screenshotsDir, '05-funcionarios.png'),
            fullPage: true
        });

        // 6. ENCARREGADOS
        console.log('📸 Capturando: Encarregados...');
        await page.goto(`${baseURL}/encarregados`, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.evaluate(() => {
            const closeBtn = document.querySelector('.swal2-close, button[aria-label="Close"]');
            if (closeBtn) closeBtn.click();
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        await page.screenshot({
            path: path.join(screenshotsDir, '06-encarregados.png'),
            fullPage: true
        });

        // 7. ADMINISTRADORES
        console.log('📸 Capturando: Administradores...');
        await page.goto(`${baseURL}/administradores`, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({
            path: path.join(screenshotsDir, '07-administradores.png'),
            fullPage: true
        });

        // 8. APONTAMENTO DE HORAS
        console.log('📸 Capturando: Apontamento de Horas...');
        await page.goto(`${baseURL}/timesheet`, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({
            path: path.join(screenshotsDir, '08-apontamento.png'),
            fullPage: true
        });

        // 9. MONITORAMENTO (NOVO!)
        console.log('📸 Capturando: Monitoramento Real-Time...');
        await page.goto(`${baseURL}/monitoramento`, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({
            path: path.join(screenshotsDir, '09-monitoramento.png'),
            fullPage: true
        });

        // 10. APROVAÇÕES
        console.log('📸 Capturando: Aprovações...');
        await page.goto(`${baseURL}/approvals`, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({
            path: path.join(screenshotsDir, '10-aprovacoes.png'),
            fullPage: true
        });

        // 11. FATURAMENTO
        console.log('📸 Capturando: Faturamento...');
        await page.goto(`${baseURL}/billing`, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({
            path: path.join(screenshotsDir, '11-faturamento.png'),
            fullPage: true
        });

        // 12. FOLHA DE PAGAMENTO
        console.log('📸 Capturando: Folha de Pagamento...');
        await page.goto(`${baseURL}/payroll`, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({
            path: path.join(screenshotsDir, '12-folha.png'),
            fullPage: true
        });

        // 13. ANALYTICS
        console.log('📸 Capturando: Analytics...');
        await page.goto(`${baseURL}/analytics`, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({
            path: path.join(screenshotsDir, '13-analytics.png'),
            fullPage: true
        });

        // 14. MOBILE - Dashboard (viewport mobile)
        console.log('📱 Capturando versão MOBILE: Dashboard...');
        await page.setViewport({ width: 390, height: 844 }); // iPhone 14 Pro
        await page.goto(`${baseURL}/dashboard`, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({
            path: path.join(screenshotsDir, '14-mobile-dashboard.png'),
            fullPage: true
        });

        // 15. MOBILE - Monitoramento
        console.log('📱 Capturando versão MOBILE: Monitoramento...');
        await page.goto(`${baseURL}/monitoramento`, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({
            path: path.join(screenshotsDir, '15-mobile-monitoramento.png'),
            fullPage: true
        });

        // 16. MOBILE - Apontamento (Admin view)
        console.log('📱 Capturando versão MOBILE: Apontamento...');
        await page.goto(`${baseURL}/timesheet`, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({
            path: path.join(screenshotsDir, '16-mobile-apontamento.png'),
            fullPage: true
        });

        // 17. Funcionário - Tela de Apontamento (nova sessão)
        console.log('📸 Capturando: Apontamento Funcionário...');
        const page2 = await browser.newPage();
        await page2.evaluateOnNewDocument(() => {
            localStorage.setItem('tutorialCompleted', 'true');
        });
        await page2.setViewport({ width: 390, height: 844 });

        // Login como funcionário
        await page2.goto(`${baseURL}/login`, { waitUntil: 'networkidle0', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            await page2.waitForSelector('#passport', { visible: true, timeout: 15000 });
            await page2.type('#passport', 'GUILHERMEEE');
            await page2.waitForSelector('#password', { visible: true });
            await page2.type('#password', '010203');
            await page2.waitForSelector('button[type="submit"]', { visible: true });
            await page2.click('button[type="submit"]');
            await page2.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });

            await new Promise(resolve => setTimeout(resolve, 2000));
            await page2.screenshot({
                path: path.join(screenshotsDir, '17-apontamento-funcionario.png'),
                fullPage: true
            });
        } catch (error) {
            console.log('⚠️ Não foi possível capturar tela de funcionário:', error.message);
        }
        await page2.close();

        console.log('✅ Todas as screenshots capturadas com sucesso!');
        console.log(`📁 Salvas em: ${screenshotsDir}`);

    } catch (error) {
        console.error('❌ Erro ao capturar screenshots:', error);
    } finally {
        await browser.close();
    }
}

captureScreenshots();
