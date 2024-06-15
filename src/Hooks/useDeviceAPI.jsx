import { useContext, useEffect, useState } from 'react';
import {
  getDeviceApiKey,
  switchDeviceApiActive,
  setDeviceApiKey as generateApiKeys_API,
} from '../services/ApiServices/DeviceApiService';
import useProjectAPI from '../services/ApiServices/ProjectService';
import useProjectStore from '../stores/projectStore';

const useDeviceApi = () => {
  const { currentProject, setCurrentProject, setProjects } = useProjectStore();

  const projectAPI = useProjectAPI();

  const [readKey, setReadKey] = useState(undefined);
  const [writeKey, setWriteKey] = useState(undefined);

  const updateKeys = async () => {
    const keys = await getDeviceApiKey();
    console.log(keys);
    setReadKey(keys.readApiKey);
    setWriteKey(keys.writeApiKey);
  };

  useEffect(() => {
    updateKeys();
  }, []);

  useEffect(() => {
    updateKeys();
  }, [currentProject]);

  const refreshProjects = async () => {
    const projects = await projectAPI.getProjects();
    setProjects(projects);
  };

  const toggleDevieApi = async (state) => {
    await switchDeviceApiActive(state);
    await refreshProjects();
  };

  const generateApiKeys = async () => {
    const keys = await generateApiKeys_API();
    setReadKey(keys.readApiKey);
    setWriteKey(keys.writeApiKey);
  };

  return {
    toggleDevieApi: toggleDevieApi,
    generateApiKeys: generateApiKeys,
    readKey: readKey,
    writeKey: writeKey,
  };
};

export default useDeviceApi;
