import { CmakeProcess } from '../../../cppLlvmCoverage';

class SucceedingCmakeProcess implements CmakeProcess {
    cmakeCommand: string = '';

    checkCmakeVersion() {
        return Promise.resolve("");
    }

    buildCmakeTarget() {
        return Promise.resolve();
    }
};

class FailingCmakeProcess implements CmakeProcess {
    cmakeCommand: string = '';

    checkCmakeVersion() {
        return Promise.reject(new Error());
    }

    buildCmakeTarget() {
        return Promise.reject(new Error());
    }
};

class FailingCmakeProcessForTargetBuilding implements CmakeProcess {
    cmakeCommand: string = '';

    checkCmakeVersion() {
        return Promise.resolve("");
    }

    buildCmakeTarget() {
        return Promise.reject(new Error());
    }
}

export function buildAnyCmakeProcess() {
    return new SucceedingCmakeProcess();
}

export function buildFailingCmakeProcess() {
    return new FailingCmakeProcess();
}

export function buildSucceedingCmakeProcess() {
    return new SucceedingCmakeProcess();
}

export function buildFailingCmakeProcessForTargetBuilding() {
    return new FailingCmakeProcessForTargetBuilding();
}