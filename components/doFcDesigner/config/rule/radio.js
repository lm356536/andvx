import uniqueId from '@form-create/utils/lib/unique';

import { localeProps, makeOptionsRule, makeRequiredRule} from '../../utils/index2';
import {  useLocale } from '../../utils/index2';
import ZhCn from '../../locale/zh-cn';

const label = '单选框';
const name = 'radio';

export default {
    icon: 'icon-radio',
    label,
    name,
    rule({t}) {
        console.log('rule: ', t)
        const opt = t('props.option');
        return {
            type: name,
            field: uniqueId(),
            title: t('components.radio.name'),
            info: '',
            effect: {
                fetch: ''
            },
            props: {},
            options: [1, 2].map(value => {
                console.log('options:', opt)
                return {
                    label: opt + value,
                    value,
                }
            })
        };
    },
    props(_, {t}) {
        console.log('radio t: ', t)
        // const t = useLocale(ZhCn).t

        return localeProps(t, name + '.props', [
            makeRequiredRule(),
            makeOptionsRule(t, 'options'),
            {type: 'switch', field: 'disabled', title: '是否禁用'}, {
                type: 'switch',
                field: 'type',
                title: '按钮形式',
                props: {activeValue: 'button', inactiveValue: 'default'}
            }, {type: 'input', field: 'textColor', title: '按钮形式的 Radio 激活时的文本颜色'}, {
                type: 'input',
                field: 'fill',
                title: '按钮形式的 Radio 激活时的填充色和边框色'
            }]);
    }
};
