import Form, { IChangeEvent } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { useState } from 'react';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  useCurrentProject,
  useSaveCurrentProject,
} from '~/contexts/CurrentProject';

import { Project, ProjectSchema } from '~/lib/Project';

const schema = zodToJsonSchema(ProjectSchema);

export function ProjectView() {
  const project = useCurrentProject();
  // @ts-ignore
  const saveProject = useSaveCurrentProject();

  const [changeEvent, setChangeEvent] = useState<any>();

  async function handleChange({
    errors,
    formData,
    status,
  }: IChangeEvent<Project>) {
    setChangeEvent({ errors, formData, status });
    if (errors && errors.length > 0) {
      return;
    }
    for (const [key, value] of Object.entries(formData ?? {})) {
      // @ts-expect-error
      project[key as keyof Project] = value;
    }
    await saveProject();
  }

  return (
    <pre>
      <Form
        formData={project}
        onChange={handleChange}
        schema={schema}
        validator={validator}
      />
      {JSON.stringify(changeEvent, null, 2)}
    </pre>
  );
}
