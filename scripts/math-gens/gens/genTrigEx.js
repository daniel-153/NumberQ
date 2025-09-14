import * as H from '../helpers/gen-helpers.js';
import * as PH from '../helpers/polynom-helpers.js';

export function validateSettings(form_obj, error_locations) {
    // use sine and cosine if nothing was selected
    if (form_obj.trig_function_types === undefined) form_obj.trig_function_types = ['sine','cosine'];
}

const TEH = { // genTrigEx helpers
    normalizeAngle: function(theta_deg) { // convert an arbtrirary integer-valued degree angle -> [0,360) scale
        return ((theta_deg % 360) + 360) % 360;
    },
    sin2_30_60: (theta_deg) => ({30: [1, 4], 45: [2, 4], 60: [3, 4]}[theta_deg]),
    sin2: function(theta_deg) {
        theta_deg = this.normalizeAngle(theta_deg);
        let n_d;
        if ((0 < theta_deg && theta_deg < 90) || (180 < theta_deg && theta_deg < 270)) n_d = this.sin2_30_60(Math.abs(theta_deg) % 90);
        else if ((90 < theta_deg && theta_deg < 180) || (270 < theta_deg && theta_deg < 360)) n_d = this.sin2_30_60(90 - (Math.abs(theta_deg) % 90));
        else if (theta_deg % 90 === 0 && (theta_deg / 90) % 2 === 0) n_d = [0, 4]; // even divisibility by 90 (0, 180, ...)
        else if (theta_deg % 90 === 0 && (theta_deg / 90) % 2 === 1) n_d = [4, 4]; // odd divisibility by 90 (90, 270, ...)

        if (180 < theta_deg && theta_deg < 360) n_d[0] *= -1;

        return n_d;
    },
    cos2: function(theta_deg) {
        return this.sin2(theta_deg + 90);
    },
    tan2: function(theta_deg) {
        const top_n_d = this.sin2(theta_deg);
        const bot_n_d = this.cos2(theta_deg);

        return [top_n_d[0]*bot_n_d[1], top_n_d[1]*bot_n_d[0]];
    },
    degToRad: function(theta_deg) {
        const simplified_str = PH.simplifiedFracString(theta_deg, 180, 'in_front');

        if (simplified_str.includes('\\frac')) { // insert \pi into the frac numer
            let frac_numer = simplified_str.split('\\frac{')[1].split('}{')[0];
            if (frac_numer === '1' || frac_numer === '-1') frac_numer = frac_numer.slice(0, -1);

            return (simplified_str.split('\\frac{')[0] + '\\frac{' + frac_numer + '\\pi' + '}{' + simplified_str.split('}{')[1]);
        }
        else if (simplified_str === '0') return '0';
        else if (simplified_str === '1' || simplified_str === '-1') return simplified_str.slice(0, -1) + '\\pi';
        else return simplified_str + '\\pi';
    }
};
export default function genTrigEx(settings) {
    // determine which angular units are used 
    let angular_unit;
    if (settings.angular_unit === 'radians') angular_unit = 'radians';
    else if (settings.angular_unit === 'degrees') angular_unit = 'degrees';
    else if (settings.angular_unit === 'both') angular_unit = H.randFromList(['radians', 'degrees']);

    // determine which argument sign is used
    let argument_sign;
    if (settings.argument_sign === 'positive') argument_sign = 'positive';
    else if (settings.argument_sign === 'negative') argument_sign = 'negative';
    else if (settings.argument_sign === 'both') argument_sign = H.randFromList(['positive', 'negative']);

    // determine the trig func to apply
    const trig_func_name_map = {'sine': 'sin', 'cosine': 'cos', 'tangent': 'tan'};
    const trig_func = trig_func_name_map[H.randFromList(settings.trig_function_types)];

    // pick a random location on the unit circle (in degrees) and multiply by chosen sign
    let chosen_angle = ( H.randFromList([0, 30, 45, 60]) + 90 * H.randInt(0, 3) ) * ((argument_sign === 'negative')? (-1) : (1));
    if (chosen_angle === 0) chosen_angle = Math.abs(chosen_angle); // handle -0 (negative zero) case
    let n_d_output = TEH[trig_func + '2'](chosen_angle);

    // convert the n_d_output to traditional trig function output representation
    let answer_str;
    if (n_d_output[1] === 0) answer_str = '\\text{undefined}'; // zero denominator
    else if (n_d_output[0] === 0) answer_str = '0'; // zero numerator, non-zero denominator
    else { // non-zero numerator and denominator
        const sign_of_n_d_output = Math.sign(n_d_output[0]) / Math.sign(n_d_output[1]);
        const abs_n_d_output = n_d_output.map(num_and_den => Math.abs(num_and_den));
        
        const frac_expr = {num: sign_of_n_d_output, den: abs_n_d_output[1], root: abs_n_d_output[0]*abs_n_d_output[1]};
        
        const extracted_root = PH.simplifySQRT(frac_expr.root); // extract root and update values
        [frac_expr.num, frac_expr.root] = [frac_expr.num * extracted_root.numberInFront, extracted_root.numberUnderRoot];

        const simplified_frac = PH.simplifyFraction(frac_expr.num, frac_expr.den); // simplify frac and update values
        [frac_expr.num, frac_expr.den] = [simplified_frac.numer, simplified_frac.denom];

        if (frac_expr.root === 1) { // no root expression 
            answer_str = PH.simplifiedFracString(frac_expr.num, frac_expr.den, 'in_front');
        }
        else { // root expression
            const root_str = `\\sqrt{${frac_expr.root}}`;
            if (frac_expr.den === 1) { // whole number
                if (Math.abs(frac_expr.num) === 1) answer_str = String(frac_expr.num).slice(0, -1) + root_str;
                else answer_str = frac_expr.num + root_str;
            }
            else { // reduced frac
                const num_sign_str = String(Math.sign(frac_expr.num)).slice(0, -1);
                let abs_num_str = (Math.abs(frac_expr.num) === 1)? '' : String(Math.abs(frac_expr.num));
                answer_str = `${num_sign_str}\\frac{${abs_num_str}${root_str}}{${frac_expr.den}}`;
            }
        }
    }
    
    let trig_arg_str;
    if (angular_unit === 'degrees') {
        trig_arg_str = chosen_angle + '^\\circ';

        if (trig_arg_str === '0^\\circ' && H.randInt(0, 1) === 1) {
            trig_arg_str = `${(argument_sign === 'negative')? '-':''}360^\\circ`; // randomly switch 0 to \pm 360 - 50% of the time
        }
    }
    else if (angular_unit === 'radians') {
        trig_arg_str = TEH.degToRad(chosen_angle);

        if (trig_arg_str === '0' && H.randInt(0, 1) === 1) {
            trig_arg_str = `${(argument_sign === 'negative')? '-':''}2\\pi`; // randomly switch 0 to \pm 2pi - 50% of the time
        }
    }

    const prompt_str = `\\${trig_func}\\left(${trig_arg_str}\\right)`;

    return {
        question: prompt_str,
        answer: answer_str
    };
} 

export const settings_fields = [
    'angular_unit',
    'argument_sign',
    'trig_function_types'
];

export const presets = {
    default: function() {
        return {
            angular_unit: 'radians',
            argument_sign: 'positive',
            trig_function_types: ['sine','cosine']
        };
    },
    random: function() {
        return {
            angular_unit: '__random__',
            argument_sign: '__random__',
            trig_function_types: '__random__'
        };
    },
    has_topic_presets: true
};

export const size_adjustments = {
    height: 1.2,
    q_font_size: 1.2,
    a_font_size: 1.2
};