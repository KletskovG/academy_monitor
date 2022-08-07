import { EEnvVariable, ArgvMap } from "types/EEnvVariable";

export const getEnvVariable = (envVariable: EEnvVariable): string => {
  if (process.argv[ArgvMap[envVariable]]) {
    return process.argv[ArgvMap[envVariable]];
  }

  if (process.env[envVariable]) {
    return process.env[envVariable];
  }

  return `EMPTY ENV VARIABLE ${envVariable}`;
};
