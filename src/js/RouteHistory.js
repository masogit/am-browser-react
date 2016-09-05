// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { createHistory, useBasename } from 'history';
import {BASE_NAME} from './constants/ServiceConfig';
export default useBasename(createHistory)(BASE_NAME == '/' ? {} : {basename: BASE_NAME});
