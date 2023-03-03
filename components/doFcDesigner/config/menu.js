import radio from './rule/radio';
import checkbox from './rule/checkbox';
import card from './rule/card';
import input from './rule/input';
import inputPassword from './rule/inputPassword';
import inputTextArea from './rule/inputTextArea';
import number from './rule/number';
import select from './rule/select';
import _switch from './rule/switch';
import slider from './rule/slider';
import time from './rule/time';
import timeRangePicker from './rule/timeRangePicker';
import date from './rule/date';
import dateRangePicker from './rule/dateRangePicker';
import rate from './rule/rate';
import row from './rule/row';
import divider from './rule/divider';
import cascader from './rule/cascader';
// import upload from './rule/upload';
import transfer from './rule/transfer';
import tree from './rule/tree';
import alert from './rule/alert';
import span from './rule/span';
import space from './rule/space';
import button from './rule/button';
// import editor from './rule/editor';
import progress from './rule/progress';
import hidden from './rule/hidden';
import tab from './rule/tab';
import group from './rule/group';
import table from './rule/table';

export default function createMenu({t}) {
    console.log('createMenu t:', t)
    return [
        {
            name: 'main',
           
            title: t('menu.main'),
            list: [
                input, inputPassword, inputTextArea,
                number, radio, checkbox,
                date, dateRangePicker, select,
                time, timeRangePicker, _switch,
                slider, rate, cascader,
                transfer, tree, hidden
            ]
        },
        {
            name: 'aide',
            title: t('menu.aide'),
            list: [
                alert, button, span, divider, progress
            ]
        },
        {
            name: 'layout',
            title: t('menu.layout'),
            list: [
                row, space, group, table, card, tab
            ]
        },
    ];
}