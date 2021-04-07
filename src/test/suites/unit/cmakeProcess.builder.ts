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

class FailingCmakeProcessForCmakeCommandCheck implements CmakeProcess {
    cmakeCommand: string = '';

    checkCmakeVersion() {
        return Promise.reject(new Error());
    }

    buildCmakeTarget() {
        return Promise.resolve();
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

export function buildFailingCmakeProcessForCmakeCommandCheck() {
    return new FailingCmakeProcessForCmakeCommandCheck();
}

export function buildSucceedingCmakeProcess() {
    return new SucceedingCmakeProcess();
}

export function buildFailingCmakeProcessForTargetBuilding() {
    return new FailingCmakeProcessForTargetBuilding();
}