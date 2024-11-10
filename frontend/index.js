import { backend } from 'declarations/backend';

class PartyRSVP {
    constructor() {
        this.connected = false;
        this.principal = null;
        this.init();
    }

    async init() {
        const connectButton = document.getElementById('connectWallet');
        connectButton.addEventListener('click', () => this.connect());
        
        document.getElementById('rsvpForm').addEventListener('submit', (e) => this.handleRSVP(e));
        
        if (window.ic?.plug) {
            const connected = await window.ic.plug.isConnected();
            if (connected) {
                this.connected = true;
                await this.updateUI();
                await this.loadAttendees();
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

            const whitelist = [];
            const host = 'https://mainnet.dfinity.network';
            
            await window.ic.plug.requestConnect({
                whitelist,
                host
            });

            const connected = await window.ic.plug.isConnected();
            if (!connected) throw new Error('Failed to connect to Plug wallet');

            this.connected = true;
            this.principal = await window.ic.plug.agent.getPrincipal();
            await this.updateUI();
            await this.loadAttendees();
        } catch (error) {
            console.error('Connection error:', error);
            alert(`Failed to connect: ${error.message}`);
        } finally {
            this.showLoader(false);
        }
    }

    async handleRSVP(e) {
        e.preventDefault();
        this.showLoader(true);

        try {
            const name = document.getElementById('name').value;
            const guests = parseInt(document.getElementById('guests').value);

            await backend.registerAttendance(name, guests);
            await this.loadAttendees();
            document.getElementById('rsvpForm').reset();
            alert('RSVP submitted successfully!');
        } catch (error) {
            console.error('RSVP error:', error);
            alert(`Failed to submit RSVP: ${error.message}`);
        } finally {
            this.showLoader(false);
        }
    }

    async loadAttendees() {
        try {
            const attendees = await backend.getAttendees();
            const attendeesList = document.getElementById('attendeesList');
            attendeesList.innerHTML = '';

            if (attendees.length === 0) {
                attendeesList.innerHTML = '<p class="text-center">No RSVPs yet</p>';
                return;
            }

            const list = document.createElement('ul');
            list.className = 'list-unstyled';
            
            attendees.forEach(([name, guestCount]) => {
                const li = document.createElement('li');
                li.className = 'mb-2';
                li.innerHTML = `
                    <span class="attendee-name">${name}</span>
                    <span class="guest-count">${guestCount > 0 ? `+${guestCount} guests` : 'No additional guests'}</span>
                `;
                list.appendChild(li);
            });

            attendeesList.appendChild(list);
        } catch (error) {
            console.error('Error loading attendees:', error);
        }
    }

    async updateUI() {
        const walletInfo = document.getElementById('walletInfo');
        const connectButton = document.getElementById('connectWallet');

        if (this.connected) {
            walletInfo.classList.remove('d-none');
            connectButton.classList.add('d-none');
        } else {
            walletInfo.classList.add('d-none');
            connectButton.classList.remove('d-none');
        }
    }
}

window.addEventListener('load', () => {
    new PartyRSVP();
});
