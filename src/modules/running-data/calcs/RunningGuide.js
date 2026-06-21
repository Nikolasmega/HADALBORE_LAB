import { EngineeringDisclaimer } from '../../../components/EngineeringDisclaimer.js';

/**
 * RunningGuide.js
 * Extracted component containing layout and recommendations for running and circulation:
 * - Running Speed limits, RPM limits, Hook Margins
 * - Detailed running & circulation guide, Completion operational risks
 * - DO/DON'T recommended and forbidden panels
 */
export class RunningGuide {
  static renderRunningGuide(lang, unitSystem) {
    const isRu = lang === 'ru';
    return `
      <div class="space-y-5 font-sans text-xs select-none">
        ${EngineeringDisclaimer.render(lang)}
        
        <!-- Key Parameters Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-1">
            <span class="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">${isRu ? 'Скорость спуска (Running Speed)' : 'Running Speed Limits'}</span>
            <p class="font-extrabold text-zinc-900 dark:text-white text-sm font-mono mt-1">${isRu ? '0.3 - 0.5 м/с' : '0.3 - 0.5 m/s'}</p>
            <p class="text-[9.5px] text-zinc-500 dark:text-zinc-450 mt-1">${isRu ? 'В открытом стволе. До 1.5 м/с в обсадной колонне для предотвращения гидроудара.' : 'In open hole. Up to 1.5 m/s in casing to prevent surge/swab.'}</p>
          </div>
          <div class="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-1">
            <span class="text-[8px] font-bold text-zinc-400 dark:text-zinc-555 block uppercase tracking-widest">${isRu ? 'Вращение ротора (RPM Limits)' : 'RPM & Rotation Limits'}</span>
            <p class="font-extrabold text-zinc-900 dark:text-white text-sm font-mono mt-1">40 - 60 RPM</p>
            <p class="text-[9.5px] text-zinc-500 dark:text-zinc-450 mt-1">${isRu ? 'Максимум при проработке (Washing). Направление свинчивания: 5-10 RPM.' : 'Max during washing down. Stabbing make-up speed: 5-10 RPM.'}</p>
          </div>
          <div class="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-1">
            <span class="text-[8px] font-bold text-zinc-400 dark:text-zinc-555 block uppercase tracking-widest">${isRu ? 'Затяжка/разгрузка (Hook Margins)' : 'Pickup / Slack-off Margins'}</span>
            <p class="font-extrabold text-zinc-900 dark:text-white text-sm font-mono mt-1">15% - 20%</p>
            <p class="text-[9.5px] text-zinc-500 dark:text-zinc-455 mt-1">${isRu ? 'Предельный марж от веса на крюке перед остановкой спуска.' : 'Max margin from hook load before stopping and investigating.'}</p>
          </div>
        </div>

        <!-- Detailed Recommendations & Risks -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <h4 class="text-[10px] font-extrabold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-855 pb-2">
              ${isRu ? 'Рекомендации по спуску и промывке' : 'Running & Circulation Guide'}
            </h4>
            <div class="space-y-3">
              <div>
                <span class="font-bold text-zinc-950 dark:text-white block text-[9.5px]">${isRu ? 'Контроль гидродинамики (Surge/Swab)' : 'Surge & Swab Monitoring'}</span>
                <p class="text-[9.5px] text-zinc-500 dark:text-zinc-450 leading-relaxed mt-0.5">${isRu ? 'Узкие кольцевые зазоры вызывают гидродинамический напор. Увеличивайте скорость спуска плавно. Контролируйте долив скважины.' : 'Narrow annular clearance creates high surge pressures. Move the string slowly, increase speed progressively, and monitor fluid displacement.'}</p>
              </div>
              <div>
                <span class="font-bold text-zinc-900 dark:text-white block text-[9.5px]">${isRu ? 'Инструкция по промывке (Circulation)' : 'Circulation Best Practices'}</span>
                <p class="text-[9.5px] text-zinc-500 dark:text-zinc-450 leading-relaxed mt-0.5">${isRu ? 'Начинайте промывку на минимальной подаче насоса для снижения давления разрушения геля раствора. Избегайте резкого пуска насосов.' : 'Initiate circulation at minimum flow rate to break mud gel strength slowly, avoiding formation fracture. Do not start pumps abruptly.'}</p>
              </div>
              <div>
                <span class="font-bold text-zinc-900 dark:text-white block text-[9.5px]">${isRu ? 'Подготовка и шаблонирование (Drifting)' : 'Preparation & Drifting'}</span>
                <p class="text-[9.5px] text-zinc-500 dark:text-zinc-450 leading-relaxed mt-0.5">${isRu ? 'Каждая труба должна пройти шаблонирование (Drift) непосредственно перед спуском. Проверьте чистоту уплотнительных торцов.' : 'Drift every joint at the rig floor immediately before running. Clean and inspect all metal-to-metal sealing surfaces.'}</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <h4 class="text-[10px] font-extrabold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-855 pb-2">
              ${isRu ? 'Операционные риски заканчивания' : 'Completion Operational Risks'}
            </h4>
            <div class="space-y-3">
              <div>
                <span class="font-bold text-zinc-900 dark:text-white block text-[9.5px]">${isRu ? 'Дифференциальный прихват (Differential Sticking)' : 'Differential Sticking Risk'}</span>
                <p class="text-[9.5px] text-zinc-500 dark:text-zinc-450 leading-relaxed mt-0.5">${isRu ? 'Риск высок в проницаемых пластах при высокой репрессии. Минимизируйте время статических остановок колонны.' : 'High risk in depleted permeable zones with high overbalance. Minimize static string time; keep string moving.'}</p>
              </div>
              <div>
                <span class="font-bold text-zinc-900 dark:text-white block text-[9.5px]">${isRu ? 'Задиры резьбы (Thread Galling)' : 'Premium Thread Galling'}</span>
                <p class="text-[9.5px] text-zinc-500 dark:text-zinc-450 leading-relaxed mt-0.5">${isRu ? 'Особенно уязвимы нержавеющие стали (13Cr). Всегда используйте калиброванные датчики момента и правильную смазку.' : 'Stainless alloys (13Cr) are highly prone to cold welding. Always use proper API/OEM thread compound and computer torque monitoring.'}</p>
              </div>
              <div>
                <span class="font-bold text-zinc-900 dark:text-white block text-[9.5px]">${isRu ? 'Смятие колонны (Tubing Collapse)' : 'Tubing Collapse Hazards'}</span>
                <p class="text-[9.5px] text-zinc-500 dark:text-zinc-450 leading-relaxed mt-0.5">${isRu ? 'Возникает при превышении затрубного давления над трубным. Контролируйте плотность и уровень растворов в обеих полостях.' : 'Happens when external pressure exceeds internal capacity. Maintain fluid levels and mud densities within design limits.'}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Do & Don't Split Panels -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- DO -->
          <div class="border border-emerald-200/40 dark:border-emerald-900/30 bg-emerald-50/10 dark:bg-emerald-950/5 rounded-xl p-4 space-y-2.5">
            <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 block uppercase tracking-wider">${isRu ? 'РЕКОМЕНДУЕТСЯ (DO)' : 'RECOMMENDED (DO)'}</span>
            <ul class="list-disc pl-4 space-y-1 text-[9.5px] text-zinc-700 dark:text-zinc-350">
              <li>${isRu ? 'Используйте сертифицированную резьбовую смазку' : 'Use certified API or proprietary thread compound.'}</li>
              <li>${isRu ? 'Контролируйте вес на крюке каждые 5-10 свечей' : 'Verify hook load baseline every 5-10 stands.'}</li>
              <li>${isRu ? 'Медленно свинчивайте резьбу на первой стадии' : 'Stab and align connection carefully before high torque.'}</li>
              <li>${isRu ? 'Соблюдайте крутящий момент Make-up Torque' : 'Stick to recommended minimum/optimum torque values.'}</li>
              <li>${isRu ? 'Проверяйте состояние протекторов резьбы' : 'Ensure thread protectors remain on until joint lift.'}</li>
            </ul>
          </div>

          <!-- DON'T -->
          <div class="border border-rose-200/40 dark:border-rose-900/30 bg-rose-50/10 dark:bg-rose-950/5 rounded-xl p-4 space-y-2.5">
            <span class="text-[10px] font-bold text-rose-600 dark:text-rose-455 block uppercase tracking-wider">${isRu ? "ЗАПРЕЩЕНО (DON'T)" : "FORBIDDEN (DON'T)"}</span>
            <ul class="list-disc pl-4 space-y-1 text-[9.5px] text-zinc-700 dark:text-zinc-350">
              <li>${isRu ? "Не превышайте максимальную скорость спуска колонны" : "Do not run string faster than design surge limits."}</li>
              <li>${isRu ? "Не вращайте колонну в обратном направлении" : "Do not rotate connections backward under load."}</li>
              <li>${isRu ? "Не используйте задироопасные инструменты захвата" : "Do not use dirty or worn pipe slips and tongs."}</li>
              <li>${isRu ? "Не спускайте трубы с поврежденными торцами уплотнений" : "Never run joints with visible metal seal scratches."}</li>
              <li>${isRu ? "Не превышайте предел крутящего момента свинчивания" : "Do not make up past maximum torque limits."}</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }
}
