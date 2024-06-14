import { configureStore } from '@reduxjs/toolkit'
import projectReducer from './stores/projectSlice';

export default configureStore({
    reducer: {
        projects: projectReducer
    },
})