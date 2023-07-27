import pulse, { reset as pulseReset } from './dances/pulse.js'
import shake, { reset as shakeReset } from './dances/shake.js'
import jump, { reset as jumpReset } from './dances/jump.js'
import twist, { reset as twistReset } from './dances/twist.js'
import vanish, { reset as vanishReset } from './dances/vanish.js'
import borderColor, {
  reset as borderColorReset,
} from './dances/border-color.js'
import color, { reset as colorReset } from './dances/color.js'
import radius, { reset as radiusReset } from './dances/radius.js'
import blur, { reset as blurReset } from './dances/blur.js'
import swing, { reset as swingReset } from './dances/swing.js'
import neon, { reset as neonReset } from './dances/neon.js'
import kern, { reset as kernReset } from './dances/kern.js'
import fontSize, { reset as fontSizeReset } from './dances/font-size.js'
import borderWidth, {
  reset as borderWidthReset,
} from './dances/border-width.js'
import tilt, { reset as tiltReset } from './dances/tilt.js'
import fontColor, { reset as fontColorReset } from './dances/font-color.js'

class Dancer {
  constructor() {
    this.resets = {}
    this.dances = {}
    this.registerDance('size', pulse, pulseReset)
    this.registerDance('pulse', pulse, pulseReset)
    this.registerDance('shake', shake, shakeReset)
    this.registerDance('jump', jump, jumpReset)
    this.registerDance('twist', twist, twistReset)
    this.registerDance('vanish', vanish, vanishReset)
    this.registerDance('color', color, colorReset)
    this.registerDance('borderColor', borderColor, borderColorReset)
    this.registerDance('radius', radius, radiusReset)
    this.registerDance('blur', blur, blurReset)
    this.registerDance('swing', swing, swingReset)
    this.registerDance('neon', neon, neonReset)
    this.registerDance('kern', kern, kernReset)
    this.registerDance('borderWidth', borderWidth, borderWidthReset)
    this.registerDance('fontSize', fontSize, fontSizeReset)
    this.registerDance('tilt', tilt, tiltReset)
    this.registerDance('fontColor', fontColor, fontColorReset)
  }

  registerDance(type, dance, reset = () => {}) {
    this.dances[type] = dance
    this.resets[type] = reset
  }

  dance(type, className, ratio, options) {
    let dance = type
    if (typeof type === 'string') {
      //In case of a built in dance
      dance = this.dances[type] || this.dances['pulse']
    } else {
      //In case of a custom dance
      dance = type.dance
    }
    const elements = document.getElementsByClassName(className)
    Array.from(elements).forEach(elem => dance(elem, ratio, options))
  }

  reset(type, className) {
    let reset = type
    if (typeof type === 'string') {
      //In case of a built in dance
      reset = this.resets[type] || this.resets['pulse']
    } else {
      //In case of a custom dance
      reset = type.reset
    }
    const elements = document.getElementsByClassName(className)
    Array.from(elements).forEach(elem => reset(elem))
  }
}

export default new Dancer()
