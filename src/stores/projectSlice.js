import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getProjects } from '../services/ApiServices/ProjectService'
import { getDatasets } from '../services/ApiServices/DatasetServices';
import { getLabelings } from '../services/ApiServices/LabelingServices';

export const fetchProjects = createAsyncThunk('project/fetchProjects', async () => {
    const res = await getProjects();
    return res;
});

export const fetchDatasets = createAsyncThunk('project/fetchDatasets', async (projectId) => {
    const res = await getDatasets(projectId);
    return res;
});

export const fetchLabelings = createAsyncThunk('project/fetchLabelings', async (projectId) => {
    const res = await getLabelings(projectId);
    return res;
});

export const projectSlice = createSlice({
    name: 'project',
    initialState: {
        projects: undefined,
        currentProject: undefined,
        datasets: undefined,
        labelings: undefined,
        status: 'idle',
        error: null
    },
    reducers: {
        setCurrentProject: (state, action) => {
            state.currentProject = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.projects = action.payload;
                if (action.payload.length > 0) {
                    state.currentProject = action.payload[0];
                }
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchDatasets.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchDatasets.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.datasets = action.payload;
            })
            .addCase(fetchDatasets.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchLabelings.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchLabelings.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.labelings = action.payload;
            })
            .addCase(fetchLabelings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

// Action creators are generated for each case reducer function
export const { setCurrentProject } = projectSlice.actions

export const fetchDatasetsAndLabelings = (projectId) => async (dispatch) => {
    await dispatch(fetchDatasets(projectId));
    await dispatch(fetchLabelings(projectId));
}

export const updateCurrentProject = (project) => (dispatch) => {
    dispatch(setCurrentProject(project));
    if (project) {
        dispatch(fetchDatasetsAndLabelings(project.id));
    }
}

export default projectSlice.reducer;
