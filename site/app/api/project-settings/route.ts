import { NextResponse } from 'next/server';
import { getApiRoot } from '@/lib/ct/client';
import { ProjectSettings } from '@/types/ProjectSettings';

export async function GET() {
  try {
    const project = await getApiRoot().get().execute();
    const projectSettings: ProjectSettings = {
      name: project.body.name,
      countries: project.body.countries,
      currencies: project.body.currencies,
      languages: project.body.languages,
      projectKey: project.body.key,
    };

    return NextResponse.json(projectSettings);
  } catch {
    return NextResponse.json({ error: 'Unable to load project settings.' }, { status: 500 });
  }
}