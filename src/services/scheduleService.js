import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const DISCORD_WEBHOOK_URL =
  import.meta.env.VITE_DISCORD_WEBHOOK_URL ||
  'https://discord.com/api/webhooks/1563083929932664882/XB9SCk_ST_OVmZPDU8z5k93ivkPYxQzIwCkQgitMh-_3Z5y47QeZYW0Fwtfd8itGgLdb';

/**
 * Format Date to YYYY-MM-DD in local time
 */
export const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Sends a strict accountability alert message to the Discord Webhook
 */
export const sendDiscordAccountabilityAlert = async ({ userEmail, taskTitle, category, missedDate }) => {
  if (!DISCORD_WEBHOOK_URL) return;

  const payload = {
    username: "FlowDo Accountability Sentinel",
    avatar_url: "https://cdn-icons-png.flaticon.com/512/564/564619.png",
    embeds: [
      {
        title: "🚨 FLOWDO ACCOUNTABILITY ALERT: MISSED TASK DETECTED",
        description: `**Discipline Failure Notice for:** \`${userEmail}\`\n\n` +
          `A scheduled commitment was **NOT** completed yesterday as planned.\n\n` +
          `📋 **Task:** ${taskTitle}\n` +
          `🏷️ **Category:** ${category}\n` +
          `📅 **Missed Date:** ${missedDate}\n\n` +
          `⚠️ **Strict Accountability Warning:**\n` +
          `> *"Small disciplines repeated with consistency every day lead to great achievements gained slowly over time."*\n` +
          `You missed yesterday's milestone. Procrastination is the thief of potential. Reset, refocus, and crush today's objectives!`,
        color: 15548997, // Discord Red #ED4245
        fields: [
          {
            name: "Status",
            value: "❌ FAILED / INCOMPLETE",
            inline: true
          },
          {
            name: "Action Required",
            value: "Execute today's tasks immediately",
            inline: true
          }
        ],
        footer: {
          text: "FlowDo • Azhryyy@all rights reserved"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.warn(`[FlowDo] Discord webhook responded with status ${res.status}`);
    } else {
      console.log(`[FlowDo] Discord accountability alert dispatched for: "${taskTitle}"`);
    }
  } catch (err) {
    console.error('[FlowDo] Error sending Discord accountability alert:', err);
  }
};

/**
 * Client-Side Check on App Mount:
 * 1. Checks today's day of week & auto-injects scheduled tasks into `tasks` table if not already present.
 * 2. Checks yesterday's day of week & detects uncompleted tasks, firing Discord webhook alerts.
 */
export const runScheduleAutoInjectionAndMissedCheck = async (user) => {
  if (!user || !user.id || !isSupabaseConfigured) {
    return { injected: 0, missedCount: 0 };
  }

  try {
    const now = new Date();
    const todayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const todayStr = formatDateKey(now);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayIndex = yesterday.getDay();
    const yesterdayStr = formatDateKey(yesterday);

    // 1. Fetch user's active schedules
    const { data: schedules, error: schedError } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', user.id);

    if (schedError) {
      console.error('[FlowDo] Failed to fetch schedules:', schedError);
      return { injected: 0, missedCount: 0 };
    }

    if (!schedules || schedules.length === 0) {
      return { injected: 0, missedCount: 0 };
    }

    // 2. Fetch recent tasks (today & yesterday) to verify existing or completed tasks
    const { data: existingTasks, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', `${yesterdayStr}T00:00:00.000Z`);

    if (taskError) {
      console.error('[FlowDo] Failed to fetch recent tasks:', taskError);
      return { injected: 0, missedCount: 0 };
    }

    let injectedCount = 0;

    // A. AUTO-INJECTION for TODAY
    for (const schedule of schedules) {
      const days = schedule.days_of_week || [];
      if (days.includes(todayIndex)) {
        // Check if task already injected or exists today with matching title
        const alreadyExistsToday = existingTasks?.some(t => {
          const taskDate = formatDateKey(new Date(t.created_at));
          return taskDate === todayStr && t.title.toLowerCase().trim() === schedule.task_title.toLowerCase().trim();
        });

        if (!alreadyExistsToday) {
          const { error: insertErr } = await supabase
            .from('tasks')
            .insert([
              {
                user_id: user.id,
                title: schedule.task_title,
                category: schedule.category || 'General',
                status: 'pending',
                created_at: new Date().toISOString()
              }
            ]);

          if (!insertErr) {
            injectedCount++;
            console.log(`[FlowDo] Auto-injected scheduled task for today: "${schedule.task_title}"`);
          }
        }
      }
    }

    // B. MISSED TASK DETECTION for YESTERDAY
    let missedCount = 0;
    for (const schedule of schedules) {
      const days = schedule.days_of_week || [];
      if (days.includes(yesterdayIndex)) {
        // Look for completed task yesterday
        const wasCompletedYesterday = existingTasks?.some(t => {
          const taskDate = formatDateKey(new Date(t.created_at));
          const completedDate = t.completed_date;
          const matchTitle = t.title.toLowerCase().trim() === schedule.task_title.toLowerCase().trim();
          return matchTitle && (completedDate === yesterdayStr || (taskDate === yesterdayStr && t.status === 'completed'));
        });

        if (!wasCompletedYesterday) {
          missedCount++;
          // Check if an alert was already dispatched today for this missed task to avoid spamming on reload
          const alertKey = `flowdo_alert_sent_${user.id}_${yesterdayStr}_${schedule.id}`;
          const alreadyAlerted = localStorage.getItem(alertKey);

          if (!alreadyAlerted) {
            await sendDiscordAccountabilityAlert({
              userEmail: user.email,
              taskTitle: schedule.task_title,
              category: schedule.category || 'General',
              missedDate: yesterdayStr
            });
            localStorage.setItem(alertKey, 'true');
          }
        }
      }
    }

    return { injected: injectedCount, missedCount };
  } catch (error) {
    console.error('[FlowDo] Error in schedule check:', error);
    return { injected: 0, missedCount: 0 };
  }
};
