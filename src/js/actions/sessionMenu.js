/**
 * Created by huling on 8/26/2016.
 */
import {
  SLACK_DEF_URL,
  LNW_DEF_URL
} from '../constants/ServiceConfig';
import Rest from '../util/grommet-rest-promise';
import {showWarning, showInfo} from './system';

export function sendMessageToSlack(messages) {
  return Rest.post(SLACK_DEF_URL, {messages}).then(res => {
    if (res.text) {
      showWarning(res.text);
    } else {
      showInfo(`Message sent to Slack:"${messages}"`);
    }
  }, err => {
    if (err && err.status == 500) {
      showWarning('Can not initialize rest client, please check your proxy setting.');
    }
  });
}

export function getVersionFromLiveNetWork() {
  return Rest.get(LNW_DEF_URL)
    .then(res => ({
      list: res.body || [],
      err: !res.body && res.text
    }));
}





