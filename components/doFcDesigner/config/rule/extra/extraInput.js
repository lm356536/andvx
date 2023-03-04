import uniqueId from '@form-create/utils/lib/unique';
// import { makeEventRule } from '../../../utils/index';

const label = '单行文本';
const name = 'extraInput';

export default {
    icon: 'icon-input',
    label,
    name,
    rule() {
        return {
            type: 'input',
            field: uniqueId(),
            title: label,
            props: {}
        };
    },
    props() {
        return [

            // { type: 'switch', field: 'allowClear', title: '是否可清空' },
            // { type: 'switch', field: 'bordered', title: '是否有边框', value: true },
            // { type: 'switch', field: 'disabled', title: '是否禁用' },
            // { type: 'input', field: 'id', title: '输入框的 id' },
            { type: 'inputNumber', field: 'maxlength', title: '文本长度' },
            // {
            //     type: 'select',
            //     field: 'size',
            //     title: '尺寸',
            //     value: 'default',
            //     options: [
            //         { label: 'large', value: 'large' },
            //         { label: 'small', value: 'small' },
            //         { label: 'default', value: 'default' },
            //     ]
            // },
            {
                type: 'select',
                field: 'type',
                title: '文本类型',
                value: 'text',
                options: [
                    { label: 'text', value: 'text' },
                    { label: 'textarea', value: 'textarea' },
                    { label: 'number', value: 'number' },
                    { label: 'password', value: 'password' },
                    { label: 'hidden', value: 'hidden' },
                ],
            },
            {
              type: 'radio', field: 'required', title: '是否必填',  value: '0', options: [
                    {label: '是', value: '1'},
                    {label: '否', value: '0'}
                ]
            }
            // makeEventRule(['change', 'pressEnter'])
        ];
    }
};