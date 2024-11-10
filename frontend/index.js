const PLUG_WALLET_ID = 'nfid';

class PlugWallet {
    constructor() {
        this.connected = false;
        this.principal = null;
        this.accountId = null;
        this.balance = 0;
        this.init();
    }

    async init() {
        const connectButton = document.getElementById('connectWallet');
        const disconnectButton = document.getElementById('disconnectWallet');
        
        connectButton.addEventListener('click', () => this.connect());
        disconnectButton.addEventListener('click', () => this.disconnect());
        
        // Check if Plug wallet is already connected
        if (window.ic?.plug) {
            const connected = await window.ic.plug.isConnected();
            if (connected) {
                this.connected = true;
                await this.updateWalletInfo();
                this.updateUI();
            }
        }
    }

    showLoader(show = true) {
        document.getElementById('loader').classList.toggle('d-none', !show);
    }

    async connect() {
        this.showLoader(true);
        
        try {
            if (!window.ic?.plug) {
                throw new Error('Plug wallet not installed');
            }

            // Request connection
            const whitelist = [];
            const host = 'https://mainnet.dfinity.network';
            
            await window.ic.plug.requestConnect({
                whitelist,
                host
            });

            // Check connection and get principal
            const connected = await window.ic.plug.isConnected();
            if (!connected) throw new Error('Failed to connect to Plug wallet');

            this.connected = true;
            await this.updateWalletInfo();
            this.updateUI();
        } catch (error) {
            console.error('Connection error:', error);
            alert(`Failed to connect: ${error.message}`);
        } finally {
            this.showLoader(false);
        }
    }

    async disconnect() {
        this.showLoader(true);
        try {
            if (window.ic?.plug) {
                await window.ic.plug.disconnect();
            }
            this.connected = false;
            this.principal = null;
            this.accountId = null;
            this.balance = 0;
            this.updateUI();
        } catch (error) {
            console.error('Disconnection error:', error);
            alert(`Failed to disconnect: ${error.message}`);
        } finally {
            this.showLoader(false);
        }
    }

    async updateWalletInfo() {
        if (!this.connected) return;

        try {
            // Get principal
            this.principal = await window.ic.plug.agent.getPrincipal();
            
            // Get account ID
            this.accountId = await window.ic.plug.accountId();
            
            // Get balance
            const balance = await window.ic.plug.requestBalance();
            this.balance = balance[0]?.amount ?? 0;
        } catch (error) {
            console.error('Error fetching wallet info:', error);
        }
    }

    updateUI() {
        const walletInfo = document.getElementById('walletInfo');
        const connectButton = document.getElementById('connectWallet');

        if (this.connected) {
            walletInfo.classList.remove('d-none');
            connectButton.classList.add('d-none');
            
            document.getElementById('principalId').textContent = this.principal?.toString() ?? 'Not available';
            document.getElementById('accountId').textContent = this.accountId ?? 'Not available';
            document.getElementById('balance').textContent = this.balance;
        } else {
            walletInfo.classList.add('d-none');
            connectButton.classList.remove('d-none');
        }
    }
}

// Initialize wallet functionality when the page loads
window.addEventListener('load', () => {
    new PlugWallet();
});
