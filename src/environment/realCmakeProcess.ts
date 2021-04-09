import { CmakeProcess } from "../services/cmakeProcess";

export class RealCmakeProcess implements CmakeProcess {
  buildCmakeTarget() { return Promise.reject(); }
  checkCmakeVersion() { return Promise.reject(); }
};
