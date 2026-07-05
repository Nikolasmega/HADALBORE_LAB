import { translateDbText } from './databaseTranslator.js';

export class ThreadCompatibility {
  /**
   * Evaluates the compatibility between a PIN (nipple) and a BOX (coupling).
   * 
   * @param {Object} pin - The selected pin thread record
   * @param {Object} box - The selected box thread record
   * @param {string} lang - Active language ('en' | 'ru')
   * @returns {Object} { status: 'green' | 'yellow' | 'red', text: string }
   */
  static check(pin, box, lang) {
    const isRu = lang === 'ru';
    
    if (!pin || !box) {
      return {
        status: 'red',
        text: isRu ? 'Неверные параметры соединения.' : 'Invalid connection parameters.'
      };
    }

    // 1. Check size (OD) mismatch
    const pinOd = parseFloat(pin.od);
    const boxOd = parseFloat(box.od);
    if (!isNaN(pinOd) && !isNaN(boxOd) && Math.abs(pinOd - boxOd) > 0.01) {
      const pinOdStr = pin.od;
      const boxOdStr = box.od;
      return {
        status: 'red',
        text: isRu
          ? `Несовпадение типоразмеров! Наружный диаметр ниппеля (${pinOdStr}") отличается от муфты (${boxOdStr}"). Прямое свинчивание физически невозможно.`
          : `Size mismatch! Pin OD (${pinOdStr}") does not match Box OD (${boxOdStr}"). Direct make-up is physically impossible.`
      };
    }

    // 2. Identical connection
    if (pin.id === box.id) {
      return {
        status: 'green',
        text: isRu
          ? 'Ниппель и муфта одного типа. Свинчивание полностью допускается. Рабочие параметры и момент свинчивания соответствуют спецификации.'
          : 'Pin and box are of the same type. Make-up is fully allowed. Operating parameters and torque limits meet nominal specifications.'
      };
    }

    // 3. Tenaris Blue & Tenaris Blue Dopeless compatibility
    const pinIsBlue = pin.id.includes('blue') || pin.id.includes('dopeless');
    const boxIsBlue = box.id.includes('blue') || box.id.includes('dopeless');
    if (pinIsBlue && boxIsBlue) {
      return {
        status: 'green',
        text: isRu
          ? 'Соединения Tenaris Blue и Tenaris Blue Dopeless имеют идентичную геометрию резьбы и уплотнения металл-металл. Свинчивание полностью допускается. Обратите внимание на разницу в смазке: Dopeless не требует нанесения резьбовой пасты на буровой.'
          : 'Tenaris Blue and Tenaris Blue Dopeless connections feature identical thread and metal-to-metal seal geometries. Make-up is fully allowed. Note lubrication difference: Dopeless requires no running dope application in the field.'
      };
    }

    // 4. VAM TOP & VAM HT compatibility
    const pinIsVamFamily = pin.id.includes('vam_top') || pin.id.includes('vam_ht');
    const boxIsVamFamily = box.id.includes('vam_top') || box.id.includes('vam_ht');
    if (pinIsVamFamily && boxIsVamFamily) {
      return {
        status: 'green',
        text: isRu
          ? 'Резьбовые соединения семейств VAM TOP и VAM HT механически совместимы. При свинчивании используйте оптимальный крутящий момент, ограниченный по минимальному из двух паспортных значений.'
          : 'VAM TOP and VAM HT thread families are mechanically compatible. Use optimal makeup torque capped at the lower value of the two connection specs.'
      };
    }

    // 5. OTTM and OTTG compatibility
    const pinIsGost = pin.id.includes('ottm') || pin.id.includes('ottg');
    const boxIsGost = box.id.includes('ottm') || box.id.includes('ottg');
    if (pinIsGost && boxIsGost) {
      return {
        status: 'yellow',
        text: isRu
          ? 'ГОСТ 632 OTTM и OTTG имеют одинаковый шаг и профиль резьбы, но OTTG оснащено плечом радиального уплотнения. Свинчивание возможно, но герметичность уплотнения металл-металл будет утеряна. Допускается только для безнапорных направлений и кондукторов.'
          : 'GOST 632 OTTM and OTTG have the same pitch and thread profile, but OTTG has a radial metal-to-metal sealing shoulder. Make-up is mechanically possible, but gas-tight seal integrity will be lost. Recommended only for low-pressure conductor or structural casing.'
      };
    }

    // 6. Completely incompatible
    return {
      status: 'red',
      text: isRu
        ? `Резьбы несовместимы! Свинчивание ниппеля ${translateDbText(pin.name, lang)} напрямую с муфтой ${translateDbText(box.name, lang)} категорически запрещено во избежание среза витков или негерметичности. Требуется переходной переводник (Crossover sub).`
        : `Connections are incompatible! Making up ${translateDbText(pin.name, lang)} Pin directly with ${translateDbText(box.name, lang)} Box is strictly prohibited to avoid thread damage or leak hazard. A crossover sub is required.`
    };
  }
}
