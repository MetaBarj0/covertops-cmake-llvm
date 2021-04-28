import { CmakeProcess } from '../../../../src/domain/ports/cmakeProcess';

class SucceedingCmakeProcess implements CmakeProcess {
  buildCmakeTarget() {
    return Promise.resolve();
  }
};

class FailingCmakeProcessForUnreachableCmake implements CmakeProcess {
  buildCmakeTarget() {
    return Promise.reject(
      "Cannot find the cmake command. Ensure the 'cmake-llvm-coverage Cmake Command' " +
      'setting is correctly set. Have you verified your PATH environment variable?');
  }
};

class FailingCmakeProcessForBadTarget implements CmakeProcess {
  buildCmakeTarget() {
    return Promise.reject(
      'Error: Could not build the specified cmake target. ' +
      "Ensure 'cmake-llvm-coverage Cmake Target' setting is properly set.");
  }
};

export function buildFakeCmakeProcess() {
  return new SucceedingCmakeProcess();
}

export function buildFailingCmakeProcessForUnreachableCmake() {
  return new FailingCmakeProcessForUnreachableCmake();
}

export function buildFailingCmakeProcessForBadTarget() {
  return new FailingCmakeProcessForBadTarget();
}

export function buildSucceedingCmakeProcess() {
  return new SucceedingCmakeProcess();
}