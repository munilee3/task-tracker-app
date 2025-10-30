const db = require('../db/db');


function getInsights() {
    // Count open tasks
    const totalOpen = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status = 'Open'").get().c;


    // Count by priority
    const byPriority = db.prepare(`SELECT priority, COUNT(*) as c FROM tasks GROUP BY priority`).all();
    const priorityDistribution = byPriority.reduce((acc, r) => { acc[r.priority] = r.c; return acc; }, {});


    // Due soon (next 3 days)
    const now = new Date();
    const in3 = new Date(now);
    in3.setDate(now.getDate() + 3);
    const isoNow = now.toISOString().slice(0, 10);
    const isoIn3 = in3.toISOString().slice(0, 10);


    const dueSoon = db.prepare(`SELECT COUNT(*) as c FROM tasks WHERE due_date BETWEEN ? AND ?`).get(isoNow, isoIn3).c;


    // Rule-based summary
    const totalOpenNum = Number(totalOpen || 0);
    let dominantPriority = 'None';
    const entries = Object.entries(priorityDistribution);
    if (entries.length) {
        const maxEntry = entries.reduce((a, b) => a[1] > b[1] ? a : b);
        dominantPriority = maxEntry[0];
    }


    let summary = `You have ${totalOpenNum} open task${totalOpenNum !== 1 ? 's' : ''}.`;
    if (dueSoon > 0) summary += ` ${dueSoon} ${dueSoon === 1 ? 'is' : 'are'} due within the next 3 days.`;
    if (dominantPriority !== 'None') summary += ` Most tasks are '${dominantPriority}' priority.`;


    // Extra advice heuristics
    const highCount = priorityDistribution['High'] || 0;
    if (totalOpenNum > 0 && highCount / Math.max(totalOpenNum, 1) >= 0.7) {
        summary += 'A large portion of open tasks are High priority consider reprioritizing or blocking time to clear them.';
    }


    return {
        totalOpen: totalOpenNum,
        priorityDistribution,
        dueSoon,
        summary
    };
}


module.exports = { getInsights };