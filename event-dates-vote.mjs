import {count, rank} from './event-dates-vote-model.mjs';

const $ = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number = n => Number.isInteger(n) ? String(n) : n.toFixed(1);
const percent = (n, total) => total ? `${(100 * n / total).toFixed(1)}%` : '0.0%';
const palette = ['#3c6955','#548066','#738b54','#9b904b','#af814a','#b96a47','#b25650','#8b4b60'];
let data, result, official, active, selectedPair, page = 0;
const label = id => data.options.find(o => o.id === id)?.label ?? id;
const short = id => label(id).replace('September','Sep').replace('October','Oct').replace('June','Jun').replace('July','Jul').replace('Sept','Sep').replaceAll('-', '–');
const total = () => data.ballots.length;
const options = ids => ids.map(id => `<option value="${escape(id)}">${escape(label(id))}</option>`).join('');
const table = (headers, rows, caption = '') => `<table>${caption ? `<caption>${caption}</caption>` : ''}<thead><tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
const cell = value => `<td>${value}</td>`;

function bar(parts, denominator = total(), percentageLabels = false) {
    const description = parts.map(p => `${p.name}: ${number(p.value)}`).join('; ');
    return `<div class="vote-bar" role="img" aria-label="${escape(description)}">${parts.map(p =>
        `<span class="${p.className || ''}" style="width:${denominator ? p.value / denominator * 100 : 0}%;${p.color ? `background:${p.color}` : ''}" title="${escape(p.name)}: ${number(p.value)} (${percent(p.value,denominator)})">${p.value / denominator > (percentageLabels ? .12 : .065) ? (percentageLabels ? percent(p.value,denominator) : number(p.value)) : ''}</span>`).join('')}</div>`;
}

function renderSummary() {
    $('official-summary').innerHTML = `<div class="vote-summary">
        <div class="vote-winner"><small>Winner in the full export</small><strong>${escape(label(official.order[0]))} 2027</strong><p>Ranked Pairs winner and Condorcet winner: preferred to every other date in a direct comparison.</p></div>
        <div><small>Ballots counted</small><strong>${total()}</strong><p>All supplied ballots included.<br>Eight candidate weeks.</p></div>
        <div><small>Head-to-head record</small><strong>7 out of 7</strong><p>Closest contest: 50–41 against 13–19 September, with 6 expressing no preference.</p></div></div>`;
}

function renderRanking() {
    let ids = [...result.order];
    const sort = $('ranking-sort').value;
    if (sort === 'calendar') ids = [...result.ids];
    if (sort === 'first') ids.sort((a,b) => result.stats[b].fractionalFirst - result.stats[a].fractionalFirst);
    if (sort === 'rejected') ids.sort((a,b) => result.stats[b].rejected - result.stats[a].rejected);
    if (sort === 'borda') ids.sort((a,b) => result.stats[b].borda - result.stats[a].borda);
    $('ranking').innerHTML = `<div class="vote-table-scroll" tabindex="0" role="region" aria-label="Date rankings">${table(
        ['Date · result position','Head-to-head wins','First-choice share','Rejected','Unranked','Borda'],
        ids.map(id => {
            const s = result.stats[id];
            return `<tr><th scope="row" class="vote-rank-date"><span class="rank-number ${id === result.order[0] ? 'rank-winner' : ''}">${result.order.indexOf(id)+1}</span>${escape(short(id))}</th>` +
                cell(`${s.wins} / ${ids.length-1}`) +
                cell(`<span class="vote-microbar"><i style="width:${s.fractionalFirst/total()*100}%"></i></span>${number(s.fractionalFirst)}`) +
                cell(`${s.rejected} <small>(${percent(s.rejected,total())})</small>`) + cell(s.unranked) + cell(number(s.borda)) + '</tr>';
        }), 'First-choice shares split tied first choices equally. Borda is an alternative score, not the official method.')}</div>`;
}

function renderMatrix() {
    const ids = result.order, mode = $('matrix-mode').value;
    $('matrix').innerHTML = `<table class="vote-matrix"><caption>${ids.length} dates · ${total()} ballots. ⋆ marks both sides of a pair whose victory was skipped to avoid a cycle.</caption>
        <thead><tr><th scope="col">Row vs column</th>${ids.map(id => `<th scope="col">${escape(short(id))}</th>`).join('')}</tr></thead>
        <tbody>${ids.map(a => `<tr><th scope="row">${ids.indexOf(a)+1}. ${escape(short(a))}</th>${ids.map(b => {
            if(a === b) return '<td class="diagonal">—</td>';
            const x = result.matrix[a][b], y = result.matrix[b][a], skipped = result.victories.some(v => !v.locked && [a,b].includes(v.winner) && [a,b].includes(v.loser));
            const color = x === y ? '#eeeee8' : x > y ? `rgba(67,133,181,${.17 + Math.abs(x-y)/total()*.63})` : `rgba(194,84,91,${.15 + Math.abs(x-y)/total()*.59})`;
            const value = mode === 'margin' ? `${x-y > 0 ? '+' : ''}${x-y}` : mode === 'percent' ? (x+y ? percent(x,x+y) : '—') : `${x}–${y}`;
            return `<td><button type="button" data-pair="${a},${b}" aria-pressed="${selectedPair[0]===a && selectedPair[1]===b}" class="${skipped ? 'cycle' : ''}" style="background:${color}" aria-label="${escape(label(a))} versus ${escape(label(b))}: ${x} to ${y}; ${total()-x-y} no preference${skipped ? '; cycle-skipped pair' : ''}">${value}${skipped ? ' ⋆' : ''}</button></td>`;
        }).join('')}</tr>`).join('')}</tbody></table>`;
}

function renderPair() {
    const [a,b] = selectedPair, x = result.matrix[a][b], y = result.matrix[b][a];
    const skipped = result.victories.find(v => !v.locked && [a,b].includes(v.winner) && [a,b].includes(v.loser));
    $('pair-detail').innerHTML = `<strong>${escape(short(a))} vs ${escape(short(b))}</strong>` +
        bar([{name:`Prefer ${short(a)}`,value:x,className:'win'},{name:'No preference',value:total()-x-y,className:'neutral'},{name:`Prefer ${short(b)}`,value:y,className:'loss'}]) +
        `<p class="vote-note" style="margin:12px 0 0">${x} prefer ${escape(short(a))} · ${y} prefer ${escape(short(b))} · ${total()-x-y} no preference (equal ranks, both omitted, or both rejected). ${skipped ? `The ${skipped.votes}–${skipped.against} victory is skipped because it would create a cycle; the ballots are not discarded.` : ''}</p>`;
}

function renderMatchups() {
    const a = $('focus-date').value;
    $('matchups').innerHTML = `<p class="vote-note">${escape(label(a))}: wins ${result.stats[a].wins} of ${result.ids.length-1} head-to-heads. Every bar represents all ${total()} ballots. Blue prefers this date; red prefers the alternative.</p>` +
        result.order.filter(b=> b!==a).map(b => {
            const x=result.matrix[a][b],y=result.matrix[b][a];
            return `<div class="vote-matchup"><span>vs ${escape(short(b))}</span>${bar([{name:`Prefer ${short(a)}`,value:x,className:'win'},{name:'No preference',value:total()-x-y,className:'neutral'},{name:`Prefer ${short(b)}`,value:y,className:'loss'}])}<span class="vote-bar-label">${x}–${y} · ${x>y?'wins':x<y?'loses':'tied'}</span></div>`;
        }).join('');
}

function renderPreferences() {
    const mode = $('preference-mode').value, pct = $('value-mode').value === 'percent';
    const ids = result.order;
    const denom = mode === 'borda' ? total()*(ids.length-1) : total();
    const value = n => pct ? percent(n,denom) : number(n);
    const explanations = {
        acceptance:'“Ranked” means placed somewhere in a rank group, not necessarily endorsed. Explicit rejection is shown separately from omission. In the count, omitted dates sit below ranked dates but above rejected dates.',
        first:'One first-choice vote per ballot is split equally among its tied top dates. A ballot with no remaining ranked dates contributes no first-choice share. Values may be fractional; displayed figures are rounded.',
        positions:'Competition ranks: a tied group occupies the same starting rank and skips the following positions (1st, 1st, 3rd). Explicit rejections and omissions are shown at the end, not as ranked positions.',
        borda:`An alternative descriptive score: ${ids.length-1} points for first, down to 0 for last. Tied positions share their average points. Omitted dates form a tied group below ranked dates; rejected dates form a separate tied group last. Percentage is of the maximum possible ${denom} points, not a vote share.`
    };
    $('preference-explanation').textContent = explanations[mode];
    $('preference-chart').innerHTML = ids.map(id => {
        const s=result.stats[id];
        let parts, detail;
        if(mode==='acceptance') {
            parts=[{name:'Ranked',value:s.ranked,color:'#548066'},{name:'Rejected',value:s.rejected,color:'#b75358'},{name:'Unranked',value:s.unranked,color:'#737d78'}];
            detail=`${value(s.ranked)} ranked`;
        } else if(mode==='first') {
            parts=[{name:'Sole first-choice ballots',value:s.first,color:'#3c6955'},{name:'Share from tied first choices',value:s.fractionalFirst-s.first,color:'#b48d3c'}];
            detail=`${value(s.fractionalFirst)} · ${s.sharedFirst} top ballots`;
        } else if(mode==='borda') {
            parts=[{name:'Borda points',value:s.borda,color:'#548066'}]; detail=`${value(s.borda)}${pct?'':' points'}`;
        } else {
            parts=s.positions.map((v,i)=>({name:`Rank ${i+1}`,value:v,color:palette[i]}));
            parts.push({name:'Rejected',value:s.rejected,color:'#414b47'},{name:'Unranked',value:s.unranked,color:'#939b96'});
            detail=`${value(s.ranked)} ranked`;
        }
        // Hover and accessible descriptions retain the exact counts.
        const chart=bar(parts,denom,pct);
        return `<div class="vote-chart-row"><span>${escape(short(id))}</span>${chart}<span class="vote-bar-label">${detail}</span></div>`;
    }).join('');
    const legends = mode==='acceptance' ? [['Ranked','#548066'],['Rejected','#b75358'],['Unranked','#737d78']] :
        mode==='first' ? [['Sole first choice','#3c6955'],['Share from tied first choices','#b48d3c']] :
        mode==='borda' ? [['Borda points','#548066']] :
        [...ids.map((_,i)=>[`Rank ${i+1}`,palette[i]]),['Rejected','#414b47'],['Unranked','#939b96']];
    $('preference-legend').innerHTML=legends.map(([name,color])=>`<span><i style="background:${color}"></i>${name}</span>`).join('');
}

function renderCount() {
    const skipped=result.victories.filter(v=>!v.locked);
    $('count-summary').innerHTML=`<strong>${escape(label(result.order[0]))} is the Ranked Pairs winner${active.length < data.options.length ? ' in this scenario' : ''}.</strong> ` +
        `${result.condorcet ? 'It also beats every other included date head-to-head (a Condorcet winner).' : 'No included date beats every other included date head-to-head.'} ` +
        `${result.victories.length-skipped.length} victories locked; ${skipped.length} skipped. ` +
        `${result.strengthTie || result.orderTie ? 'Original option order was needed to resolve an exact strength or finishing-order tie.' : 'No exact strength or finishing-order tie-break was needed.'}` +
        (skipped.length ? `<p style="margin:12px 0 0">${skipped.map(v=>`${escape(short(v.winner))} beats ${escape(short(v.loser))} ${v.votes}–${v.against}, but that edge is skipped to avoid a cycle.`).join(' ')}</p>` : '');
    $('lock-table').innerHTML=table(['Step','Victory','Votes','Margin','Decision'],result.victories.map((v,i)=>`<tr>${cell(i+1)}<th scope="row">${escape(short(v.winner))} → ${escape(short(v.loser))}</th>${cell(`${v.votes}–${v.against}`)}${cell(`+${v.margin}`)}${cell(v.locked?'Locked':'Skipped · would create a cycle')}</tr>`),'Strongest margin first, then winning votes, then original option order. Tied head-to-heads create no victory.');
}

function renderBallots() {
    const id=$('ballot-date').value, condition=$('ballot-condition').value, style=$('ballot-style').value;
    const ballots=data.ballots.filter(b=>{
        if(style==='equal' && !b.groups.some(g=>g.length>1)) return false;
        if(style==='reject' && !b.rejected.length) return false;
        if(condition==='first') return b.groups[0]?.includes(id);
        if(condition==='ranked') return rank(b,id)<Infinity;
        if(condition==='rejected') return b.rejected.includes(id);
        if(condition==='unranked') return rank(b,id)===Infinity && !b.rejected.includes(id);
        return true;
    });
    const pages=Math.max(1,Math.ceil(ballots.length/10)); page=Math.min(page,pages-1);
    $('ballot-count').textContent=`${ballots.length} of ${total()} original ballots match.`;
    $('ballot-list').innerHTML=ballots.slice(page*10,page*10+10).map(b=>{
        const omitted=data.options.filter(o=>rank(b,o.id)===Infinity && !b.rejected.includes(o.id));
        return `<article class="vote-ballot"><strong>#${b.number}</strong><div><p>${b.groups.map(g=>g.map(id=>escape(short(id))).join(' = ')).join(' <span aria-label="preferred to">→</span> ') || 'No ranked dates'}</p><p class="rejection">Rejected: ${b.rejected.map(id=>escape(short(id))).join(', ') || 'none'}</p>${omitted.length?`<small>Unranked: ${omitted.map(o=>escape(short(o.id))).join(', ')}</small>`:''}</div></article>`;
    }).join('') || '<p>No ballots match these filters.</p>';
    $('ballot-page').textContent=`Page ${page+1} of ${pages}`;
    $('ballot-prev').disabled=page===0; $('ballot-next').disabled=page===pages-1;
}

function render() {
    result=count(data.options,data.ballots,active);
    if(!selectedPair || selectedPair.some(id=>!active.includes(id))) selectedPair=result.order.slice(0,2);
    const focus=$('focus-date').value;
    $('focus-date').innerHTML=options(result.order);
    if(active.includes(focus)) $('focus-date').value=focus;
    $('scenario-status').innerHTML=active.length===data.options.length ? '' : `<div class="vote-scenario-active"><strong>Exploratory scenario · ${active.length} of 8 dates included</strong>Scenario winner: ${escape(label(result.order[0]))}. All analysis below uses this scenario, except the ballot explorer and downloads. The full-export winner above is unchanged.</div>`;
    document.querySelectorAll('#candidate-controls input').forEach(input=>input.disabled=active.length===2 && input.checked);
    renderRanking();renderMatrix();renderPair();renderMatchups();renderPreferences();renderCount();
}

async function init() {
    try {
        const response=await fetch('data/event-dates-2027-vote/ballots.json');
        if(!response.ok) throw new Error(`HTTP ${response.status}`);
        data=await response.json();
        if(data.ballots.length!==97 || data.options.length!==8) throw new Error('Unexpected dataset size; review this page before updating the snapshot.');
        active=data.options.map(o=>o.id);
        official=count(data.options,data.ballots);
        $('candidate-controls').innerHTML=data.options.map(o=>`<label><input type="checkbox" value="${escape(o.id)}" checked> ${escape(o.label)}</label>`).join('');
        $('ballot-date').innerHTML=options(official.order);
        renderSummary();render();renderBallots();
        $('vote-app').hidden=false; $('load-status').hidden=true;
        $('candidate-controls').addEventListener('change',()=>{
            active=[...document.querySelectorAll('#candidate-controls input:checked')].map(input=>input.value);render();
        });
        $('reset-scenario').addEventListener('click',()=>{
            active=data.options.map(o=>o.id);
            document.querySelectorAll('#candidate-controls input').forEach(input=>input.checked=true);render();
        });
        $('ranking-sort').addEventListener('change',renderRanking);
        $('matrix-mode').addEventListener('change',renderMatrix);
        $('matrix').addEventListener('click',event=>{
            const button=event.target.closest('[data-pair]');if(!button)return;
            selectedPair=button.dataset.pair.split(',');
            // Preserve keyboard focus when selecting a comparison.
            document.querySelectorAll('[data-pair]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
            renderPair();
        });
        $('focus-date').addEventListener('change',renderMatchups);
        ['preference-mode','value-mode'].forEach(id=>$(id).addEventListener('change',renderPreferences));
        ['ballot-date','ballot-condition','ballot-style'].forEach(id=>$(id).addEventListener('change',()=>{page=0;renderBallots();}));
        $('ballot-prev').addEventListener('click',()=>{page--;renderBallots();});
        $('ballot-next').addEventListener('click',()=>{page++;renderBallots();});
    } catch(error) {
        console.error(error);
        $('load-status').textContent='The interactive results could not be loaded. Please reload the page, or use the ballot downloads below. If previewing locally, open this page through the local web server rather than as a file.';
    }
}
init();
