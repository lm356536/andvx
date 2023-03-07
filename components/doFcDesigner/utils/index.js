/**
 * 是否必填
 * @returns 
 */
export function makeRequiredRule() {
    return {
        type: 'Required', field: 'formCreate$required', title: '是否必填'
    };
}
/**
 * 设置组件选项rule
 */
export function makeOptionsRule( to, flag) {
    const options = [
        {'label': 'JSON数据', 'value': 0},
        {'label': '接口数据', 'value': 1},
    ];

    const control = [
        {
            value: 0,
            rule: [
                {
                    type: 'Struct',
                    field: 'formCreate' + upper(to).replace('.', '>'),
                    props: {defaultValue: []}
                },
            ],
        },
        {
            value: 1,
            rule: [
                {
                    type: 'Fetch',
                    field: 'formCreateEffect>fetch',
                    props: {
                        to
                    }
                }
            ]
        }
    ];

    if (flag !== false) {
        options.splice(0, 0, {'label': '静态数据', 'value': 2});
        control.push({
            value: 2,
            rule: [
                {
                    type: 'TableOptions',
                    field: 'formCreate' + upper(to).replace('.', '>'),
                    props: {defaultValue: []}
                },
            ],
        });
    }

    return {

        type: 'radio',
        title: '数据来源',
        field: '_optionType',
        // field: 'formCreateDataSourceType',
        value: flag !== false ? 2 : 0,
        
        options,
        props: {
            optionType: 'button',
            size: 'small'
        },
        control
    };
}
export function makeEventRule(events = []) {
    return {
        type: 'object',
        title: '事件',
        field: 'formCreateOn',
        props: {
            rule: [{
                type: 'a-space',
                children: events.map(item => {
                    return {
                        type: 'struct',
                        field: item,
                        native: true,
                        props: {
                            title: `事件:${item}`,
                            defaultValue: () => { }
                        }
                    }
                })
            }]
        },
    };
}

export function upper(str) {
    return str.replace(str[0], str[0].toLocaleUpperCase());
}