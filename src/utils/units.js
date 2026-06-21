import { store } from '../core/State.js';
import { getPlaceholder } from './placeholder.js';

/**
 * Unit conversion helper functions for HADALBORE LAB.
 * Supports Metric, Imperial, and Hybrid field unit systems.
 */

export function convertTemperature(val, fromUnit = 'C') {
  const { lang, unitSystem } = store.getState();
  if (val === null || val === undefined) return getPlaceholder('na', lang);
  
  let tempC = val;
  if (fromUnit === 'F') {
    tempC = (val - 32) / 1.8;
  }
  
  if (unitSystem === 'imperial') {
    const tempF = tempC * 1.8 + 32;
    return `${Math.round(tempF)} °F`;
  }
  return `${Math.round(tempC)} °C`;
}

export function convertPressure(val, fromUnit = 'psi') {
  const { lang, unitSystem } = store.getState();
  if (val === null || val === undefined) return getPlaceholder('na', lang);

  let pressPsi = val;
  if (fromUnit === 'bar') {
    pressPsi = val * 14.5038;
  } else if (fromUnit === 'MPa') {
    pressPsi = val * 145.038;
  }

  if (unitSystem === 'imperial') {
    return `${Math.round(pressPsi)} psi`;
  } else if (unitSystem === 'metric' || unitSystem === 'hybrid') {
    const pressBar = pressPsi / 14.5038;
    return `${Math.round(pressBar)} ${lang === 'ru' ? 'бар' : 'bar'}`;
  } else {
    // Hybrid field uses bar
    const pressBar = pressPsi / 14.5038;
    return `${Math.round(pressBar)} ${lang === 'ru' ? 'бар' : 'bar'}`;
  }
}

export function convertDimension(val, type = 'od') {
  const { lang, unitSystem } = store.getState();
  if (val === null || val === undefined) return getPlaceholder('na', lang);

  if (type === 'wall_thickness') {
    // Database value is in mm
    if (unitSystem === 'imperial') {
      const valIn = val / 25.4;
      return `${valIn.toFixed(3)} in`;
    }
    return `${val.toFixed(2)} ${lang === 'ru' ? 'мм' : 'mm'}`;
  } else {
    // OD, ID, Drift: Database value is in inches
    if (unitSystem === 'metric') {
      const valMm = val * 25.4;
      return `${valMm.toFixed(1)} ${lang === 'ru' ? 'мм' : 'mm'}`;
    }
    return `${val.toFixed(3)} in`;
  }
}

export function convertWeight(val) {
  const { lang, unitSystem } = store.getState();
  if (val === null || val === undefined) return getPlaceholder('na', lang);

  // Database value is in lb/ft
  if (lang === 'ru') {
    if (unitSystem === 'metric') {
      const valKgm = val * 1.48816;
      return `${valKgm.toFixed(2)} кг/м`;
    }
    return `${val.toFixed(1)} lb/ft`;
  }

  // In English mode, always display in pounds (ppf / lb/ft)
  return `${val.toFixed(1)} lb/ft`;
}

export function convertTensile(val) {
  const { lang, unitSystem } = store.getState();
  if (val === null || val === undefined) return getPlaceholder('na', lang);

  // Database value is in lbs (pounds force)
  if (unitSystem === 'imperial') {
    return `${Math.round(val).toLocaleString()} lbs`;
  } else {
    // Metric & Hybrid uses tonnes force or kN
    const valTonnes = val * 0.00045359237;
    return `${valTonnes.toFixed(1)} ${lang === 'ru' ? 'т' : 'tf'}`;
  }
}

export function convertTorqueText(str) {
  const { unitSystem, lang } = store.getState();
  if (!str) return getPlaceholder('na', lang);
  const isMetric = unitSystem === 'metric' || unitSystem === 'hybrid';

  // Find all numbers in the string
  const numRegex = /([\d,]+)\s*(?:-\s*([\d,]+))?/g;
  const match = numRegex.exec(str.replace(/\s+/g, ''));
  if (!match) return str;

  const parseVal = (valStr) => parseFloat(valStr.replace(/,/g, ''));
  const val1 = parseVal(match[1]);
  const val2 = match[2] ? parseVal(match[2]) : null;

  if (isNaN(val1)) return str;

  const formatRes = (n1, n2, unit) => {
    const s1 = Math.round(n1).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US');
    const s2 = n2 !== null ? ` - ${Math.round(n2).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US')}` : '';
    return `${s1}${s2} ${unit}`;
  };

  const hasFtLbs = str.toLowerCase().includes('ft-lbs') || str.toLowerCase().includes('ft-lb');
  const hasNm = str.toLowerCase().includes('н·м') || str.toLowerCase().includes('n·m') || str.toLowerCase().includes('нм');

  if (isMetric && hasFtLbs) {
    // Convert ft-lbs to N-m
    const n1 = val1 * 1.35582;
    const n2 = val2 !== null ? val2 * 1.35582 : null;
    return formatRes(n1, n2, lang === 'ru' ? 'Н·м' : 'N·m');
  } 
  else if (!isMetric && hasNm) {
    // Convert N-m to ft-lbs
    const n1 = val1 * 0.737562;
    const n2 = val2 !== null ? val2 * 0.737562 : null;
    return formatRes(n1, n2, 'ft-lbs');
  }

  // If no conversion is needed but we need to localize units
  if (lang === 'ru' && str.includes('ft-lbs')) {
    return str.replace('ft-lbs', 'фут-фунтов');
  }
  if (lang === 'en' && str.includes('Н·м')) {
    return str.replace('Н·м', 'N·m');
  }
  if (lang === 'en' && str.includes('Нм')) {
    return str.replace('Нм', 'N·m');
  }
  
  return str;
}

export function convertLengthText(str) {
  const { unitSystem, lang } = store.getState();
  if (!str) return getPlaceholder('na', lang);
  const isMetric = unitSystem === 'metric' || unitSystem === 'hybrid';

  const numRegex = /([\d\.,]+)/;
  const match = numRegex.exec(str);
  if (!match) return str;

  const val = parseFloat(match[1].replace(/,/g, ''));
  if (isNaN(val)) return str;

  const hasIn = str.toLowerCase().includes('in') || str.includes('"');
  const hasMm = str.toLowerCase().includes('мм') || str.toLowerCase().includes('mm');

  if (isMetric && hasIn) {
    const valMm = val * 25.4;
    return `${valMm.toFixed(1)} ${lang === 'ru' ? 'мм' : 'mm'}`;
  }
  else if (!isMetric && hasMm) {
    const valIn = val / 25.4;
    return `${valIn.toFixed(2)} in`;
  }

  // Unit translation
  if (lang === 'ru' && str.toLowerCase().includes('in')) {
    return str.replace(/in/gi, 'дюймов');
  }
  if (lang === 'en' && str.toLowerCase().includes('мм')) {
    return str.replace(/мм/gi, 'mm');
  }

  return str;
}

export function convertStandoffText(str, lang) {
  if (!str) return getPlaceholder('na', lang);
  if (lang === 'ru') {
    return str.replace('threads', 'нитки').replace('thread', 'нитка');
  } else {
    return str.replace('нитки', 'threads').replace('нитка', 'thread').replace('ниток', 'threads');
  }
}
