const PWD_SECRET = "1234"; // Mot de passe ho an'ny Capital ihany

if(!localStorage.getItem('capital')) localStorage.setItem('capital', '0');
if(!localStorage.getItem('historique')) localStorage.setItem('historique', JSON.stringify([]));
if(!localStorage.getItem('weekly_historique')) localStorage.setItem('weekly_historique', JSON.stringify([]));
if(!localStorage.getItem('theme')) localStorage.setItem('theme', 'light');

document.addEventListener('DOMContentLoaded', () => {
    // Fampiharana ny Theme voatahiry
    applyTheme(localStorage.getItem('theme'));

    document.getElementById('btn-accueil').addEventListener('click', (e) => showSection('accueil', e));
    document.getElementById('btn-journal').addEventListener('click', (e) => showSection('journal', e));
    document.getElementById('btn-parametres').addEventListener('click', (e) => showSection('parametres', e));
    document.getElementById('btn-start-compte').addEventListener('click', () => triggerMenuClick('btn-journal'));
    document.getElementById('btn-valider-compte').addEventListener('click', validerCompte);
    document.getElementById('capital-display').addEventListener('click', afficherCapital);
    document.getElementById('btn-modifier-capital').addEventListener('click', modifierCapital);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('btn-export-excel').addEventListener('click', exportToExcel);
    document.getElementById('btn-modifier-date').addEventListener('click', deverrouillerDate);
    
    initDateCompte();
    chargerDashboard();
});

// Daty ny Compte Journalier : misy anio ho default, voarara (readonly), mila MDP raha hovaina
function initDateCompte() {
    let dateInput = document.getElementById('date-compte');
    if (!dateInput) return;
    let now = new Date();
    let iso = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    dateInput.value = iso;
    dateInput.readOnly = true;
    let btn = document.getElementById('btn-modifier-date');
    if (btn) btn.textContent = '🔒';
}

function deverrouillerDate() {
    let mdp = prompt("Ampidiro ny mot de passe raha hanova ny daty:");
    if (mdp === PWD_SECRET) {
        let dateInput = document.getElementById('date-compte');
        dateInput.readOnly = false;
        dateInput.focus();
        let btn = document.getElementById('btn-modifier-date');
        if (btn) btn.textContent = '🔓';
    } else {
        alert("Diso ny mot de passe !");
    }
}

// Navigation
function showSection(sectionId, event) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(b => {
        if(b.id !== 'theme-toggle') b.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
    if (event && event.currentTarget && event.currentTarget.id !== 'theme-toggle') {
        event.currentTarget.classList.add('active');
    } else {
        const btnId = 'btn-' + sectionId;
        const btn = document.getElementById(btnId);
        if(btn) btn.classList.add('active');
    }
    if (sectionId === 'journal') {
        initDateCompte();
    }
    chargerDashboard();
}

function triggerMenuClick(buttonId) {
    const btn = document.getElementById(buttonId);
    if (btn) btn.click();
}

// Mode Sombre / Mainty
function toggleTheme() {
    let currentTheme = localStorage.getItem('theme');
    let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btnTheme = document.getElementById('theme-toggle');
    if(btnTheme) {
        btnTheme.textContent = theme === 'dark' ? '☀️ Mode Clair' : '🌙 Mode Sombre';
    }
}

// Validation Compte & Fizarana Herinandro
function validerCompte() {
    let capital = parseFloat(localStorage.getItem('capital'));
    if(capital === 0) {
        alert("Mbola tsy nasianao Capital ao amin'ny menu fahatelo!");
        return;
    }

    let total = 0;
    const ids = ['espece', 'stock2toi', 'mvola', 'orange', 'neny', 'dada', 'tendry', 'autre', 'ras'];
    ids.forEach(id => {
        total += parseFloat(document.getElementById(id).value) || 0;
    });

    let profit = total - capital;
    let histo = JSON.parse(localStorage.getItem('historique'));

    // Daty voafidin'ny mpampiasa (default = anio, azo ovaina raha mahay MDP)
    let dateInputEl = document.getElementById('date-compte');
    let isoDate = dateInputEl && dateInputEl.value ? dateInputEl.value : null;
    let dateObj = isoDate ? new Date(isoDate + 'T00:00:00') : new Date();
    let dateStr = dateObj.toLocaleDateString('fr-FR');

    let record = {
        date: dateStr,
        isoDate: isoDate,
        timestamp: dateObj.getTime(),
        profit: profit,
        stock: parseFloat(document.getElementById('stock2toi').value) || 0,
        espece: parseFloat(document.getElementById('espece').value) || 0,
        mvola: parseFloat(document.getElementById('mvola').value) || 0,
        orange: parseFloat(document.getElementById('orange').value) || 0,
        neny: parseFloat(document.getElementById('neny').value) || 0,
        dada: parseFloat(document.getElementById('dada').value) || 0,
        tendry: parseFloat(document.getElementById('tendry').value) || 0,
        autre: parseFloat(document.getElementById('autre').value) || 0,
        ras: parseFloat(document.getElementById('ras').value) || 0
    };

    // Tsy miverina indroa ny daty iray: raha efa misy daty mitovy dia soloina ilay vao nampidirina
    let existingIndex = histo.findIndex(h => (h.isoDate && h.isoDate === isoDate) || h.date === dateStr);
    if (existingIndex !== -1) {
        histo[existingIndex] = record;
        // Alaminy indray araka ny daty (vaovao indrindra aloha)
        histo.sort((a, b) => b.timestamp - a.timestamp);
    } else {
        histo.unshift(record);
    }

    // Jereo raha feno 7 andro (herinandro) dia ampidirina ao amin'ny weekly_historique
    checkAndProcessWeekly(histo);

    if(histo.length > 60) histo.length = 60;
    localStorage.setItem('historique', JSON.stringify(histo));

    // Averina ho anio sy voarara indray ny daty ho an'ny fampidirana manaraka
    initDateCompte();

    alert("Voaray soa aman-tsara ny compte anio!");
    triggerMenuClick('btn-accueil');
}

// Fikajiana sy fitahirizana ny herinandro vita
function checkAndProcessWeekly(histo) {
    if (histo.length < 7) return;

    let weeklyHisto = JSON.parse(localStorage.getItem('weekly_historique'));
    
    // Maka ny 7 andro farany voalohany tsy mbola voarakitra
    // Ohatra tsotra: Raha mihoatra ny 7 andro ny lisitra dia alaina ny 7 andro taloha indrindra hanaovana clôture de semaine
    let last7Days = histo.slice(-7);
    let totalSemaine = last7Days.reduce((acc, curr) => acc + curr.profit, 0);
    
    let semaineNom = "Semaine du " + last7Days[6].date + " au " + last7Days[0].date;
    
    // Hamarino raha efa ao anaty historique de semaine ilay izy mba tsy hivoatra indroa
    let exists = weeklyHisto.some(w => w.nom === semaineNom);
    if (!exists && weeklyHisto.length * 7 < histo.length) {
        weeklyHisto.unshift({
            nom: semaineNom,
            total: totalSemaine,
            tendry: Math.round(totalSemaine * 0.6),
            irene: Math.round(totalSemaine * 0.4)
        });
        localStorage.setItem('weekly_historique', JSON.stringify(weeklyHisto));
    }
}

// Dashboard & Fizarana Tombony (Tsy misy MDP)
function chargerDashboard() {
    let histo = JSON.parse(localStorage.getItem('historique'));
    let weeklyHisto = JSON.parse(localStorage.getItem('weekly_historique'));
    
    let tAndroany = histo.length > 0 ? histo[0].profit : 0;
    let elAndroany = document.getElementById('tombony-androany');
    if (elAndroany) {
        elAndroany.textContent = formatMoney(tAndroany);
        elAndroany.className = tAndroany >= 0 ? 't-green' : 't-red';
    }

    let elOmaly = document.getElementById('tombony-omaly');
    let elStockOmaly = document.getElementById('stock-omaly');
    
    if(histo.length > 1) {
        let tOmaly = histo[1].profit;
        if (elOmaly) {
            elOmaly.textContent = formatMoney(tOmaly);
            elOmaly.className = tOmaly >= 0 ? 't-green' : 't-red';
        }
        if (elStockOmaly) elStockOmaly.textContent = formatMoney(histo[1].stock);
    } else {
        if (elOmaly) elOmaly.textContent = "0 Ar";
        if (elStockOmaly) elStockOmaly.textContent = "0 Ar";
    }

    // Fizarana Tombony Herinandro Ity (7 andro farany)
    let totalSemaine = 0;
    let androHita = Math.min(histo.length, 7);
    for (let i = 0; i < androHita; i++) {
        totalSemaine += histo[i].profit || 0;
    }

    let tombonyTendry = Math.round(totalSemaine * 0.6);
    let tombonyIrene = Math.round(totalSemaine * 0.4);

    let elTendry = document.getElementById('display-compte-tendry');
    let elIrene = document.getElementById('display-compte-irene');

    if (elTendry) elTendry.textContent = formatMoney(tombonyTendry);
    if (elIrene) elIrene.textContent = formatMoney(tombonyIrene);

    // Famenoana ny tableaux
    chargerTableauHistorique(histo);
    chargerTableauSemaines(weeklyHisto);
}

// Security: Capital ihany no mila Mot de Passe
function afficherCapital() {
    let mdp = prompt("Ampidiro ny mot de passe raha hijery ny Capital:");
    if(mdp === PWD_SECRET) {
        let cap = localStorage.getItem('capital');
        let el = document.getElementById('capital-display');
        el.textContent = formatMoney(cap);
        el.classList.remove('hidden-capital');
        setTimeout(() => { 
            el.textContent = "*** Ar"; 
            el.classList.add('hidden-capital'); 
        }, 5000);
    } else {
        alert("Diso ny mot de passe !");
    }
}

function modifierCapital() {
    let mdp = prompt("Ampidiro ny mot de passe fanovana Capital:");
    if(mdp === PWD_SECRET) {
        let nouveauCap = prompt("Ohatrinona ny Capital vaovao (Ar)?", localStorage.getItem('capital'));
        if(nouveauCap && !isNaN(nouveauCap)) {
            localStorage.setItem('capital', nouveauCap);
            alert("Tafiditra ny Capital vaovao.");
            chargerDashboard();
        }
    } else {
        alert("Diso ny mot de passe !");
    }
}

// Tableau Historique Semaines
function chargerTableauSemaines(weeklyHisto) {
    let tbody = document.getElementById('historique-semaines-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    if(weeklyHisto.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">Mbola tsy misy herinandro vita voarakitra.</td></tr>`;
        return;
    }
    weeklyHisto.forEach(item => {
        let colorClass = item.total >= 0 ? 't-green' : 't-red';
        tbody.innerHTML += `<tr>
            <td>${item.nom}</td>
            <td class="${colorClass}"><strong>${formatMoney(item.total)}</strong></td>
            <td>${formatMoney(item.tendry)}</td>
            <td>${formatMoney(item.irene)}</td>
        </tr>`;
    });
}

// Tableau Historique Journalier
function chargerTableauHistorique(histo) {
    let tbody = document.getElementById('historique-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    histo.forEach(item => {
        let colorClass = item.profit >= 0 ? 't-green' : 't-red';
        tbody.innerHTML += `<tr>
            <td>${item.date}</td>
            <td>${formatMoney(item.espece || 0)}</td>
            <td>${formatMoney(item.stock || 0)}</td>
            <td>${formatMoney(item.mvola || 0)}</td>
            <td>${formatMoney(item.orange || 0)}</td>
            <td>${formatMoney(item.neny || 0)}</td>
            <td>${formatMoney(item.dada || 0)}</td>
            <td>${formatMoney(item.tendry || 0)}</td>
            <td>${formatMoney(item.autre || 0)}</td>
            <td>${formatMoney(item.ras || 0)}</td>
            <td class="${colorClass}"><strong>${formatMoney(item.profit)}</strong></td>
        </tr>`;
    });
}

// Export Excel (CSV format)
function exportToExcel() {
    let weeklyHisto = JSON.parse(localStorage.getItem('weekly_historique'));
    if(weeklyHisto.length === 0) {
        alert("Tsy misy angona azo aondrana (Export) aloha hatreto.");
        return;
    }

    let csvContent = "\uFEFFHerinandro;Total Tombony;Tendry (60%);Irene (40%)\n";
    weeklyHisto.forEach(row => {
        csvContent += `"${row.nom}";"${row.total} Ar";"${row.tendry} Ar";"${row.irene} Ar"\n`;
    });

    let encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historique_semaines_cashpoint.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function formatMoney(montant) {
    return parseFloat(montant).toLocaleString('fr-FR') + " Ar";
}