import useSWR from 'swr';
import { ProjectSettings } from '@/types/ProjectSettings';

const useProjectSettings = () => {
  const response = useSWR<ProjectSettings>(
    '/api/project-settings',
    async (url: string) => {
      const result = await fetch(url);

      if (!result.ok) {
        throw new Error('Unable to load project settings.');
      }

      return result.json() as Promise<ProjectSettings>;
    },
  );

  const projectSettings = response.data ?? {};

  return { ...response, projectSettings };
};

export default useProjectSettings;
