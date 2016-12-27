/**
 * Created by huling on 12/1/2016.
 */

import ReactDOM from 'react-dom';

const getColorIndex = index => {
  switch(index % 4 + 1) {
    case 1: return 'brand';
    case 2: return 'accent-2';
    case 3: return 'accent-3';
    case 4: return 'warning';
  }
};

const setColorIndex = (series, colorIndex) => series.map((item, index) => {
  if (!item.colorIndex) {
    item.colorIndex = getColorIndex(colorIndex == undefined ? index : colorIndex);
  }
  return item;
});

const resizeBar = (node, count) => {
  // check if node is mounted
  if (!node || !node._reactInternalInstance) {
    return;
  }
  const domNode = ReactDOM.findDOMNode(node);
  const rect = domNode.getBoundingClientRect();
  let strokeWidth = Math.floor(rect.width/count);
  if (domNode.viewBox.baseVal.width != rect.width) {
    strokeWidth = strokeWidth * domNode.viewBox.baseVal.width / rect.width;
  }

  domNode.firstChild.firstChild.style.strokeWidth = strokeWidth + 'px';
};

export {
  setColorIndex,
  getColorIndex,
  resizeBar
};
