/**
 * Created by huling on 12/1/2016.
 */

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

export {
  setColorIndex,
  getColorIndex
};
