import React from 'react';
import Grommet from 'grommet';
import {getFieldStrVal} from '../../util/RecordFormat';
import {loadSetting} from '../../util/util';

const applyCondition = {
  like: (value, condition) => {
    if (value && condition) {
      return value.toLowerCase().indexOf(condition.toLowerCase()) > -1;
    }
  },

  eq: (value, condition) => {
    if (typeof condition == 'string') {
      return value.toLowerCase() == condition.toLowerCase();
    } else if (condition instanceof Array) {
      return condition.filter(cond => cond.toLowerCase() == value.toLowerCase()).length > 0;
    }
  }
};

const getIcon = (body, record) => {
  let icon = '';
  const iconMap = loadSetting('iconMap') || {};
  if (body) {
    if (iconMap) {
      const keys = Object.keys(iconMap);
      for (let i = 0; i < keys.length; i++) {
        if (icon) {
          break;
        }
        const tableName = keys[i];
        if (body.sqlname == tableName) {
          if (typeof iconMap[tableName] == 'string') {
            icon = iconMap[tableName];
            break;
          } else {
            for (let j = 0; j < iconMap[tableName].length; j++) {
              if (icon) {
                break;
              }
              const condition = iconMap[tableName][j];
              if (typeof condition == 'string') {
                icon = condition;
                break;
              } else if (record) {
                const field = body.fields.filter(field => field.sqlname == condition.field);
                if (field.length > 0) {
                  const value = getFieldStrVal(record, field[0]);
                  const methods = ['like', 'eq'];

                  for (let k = 0; k < methods.length; k++) {
                    const method = methods[k];
                    if (condition[method] && applyCondition[method](value, condition[method])) {
                      icon = condition.icon;
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      iconMap.defaultIcon = 'Inbox';
    }
  }

  icon = Grommet.Icons.Base[icon] || Grommet.Icons.Base[iconMap.defaultIcon];
  return React.createElement(icon, null);
};

export default getIcon;
