import { CmakeProcess } from '../../../../service';

class SucceedingCmakeProcess implements CmakeProcess {
    checkCmakeVersion() {
        return Promise.resolve("");
    }

    buildCmakeTarget() {
        return Promise.resolve();
    }
};

class FailingCmakeProcessForCmakeCommandCheck implements CmakeProcess {
    checkCmakeVersion() {
        return Promise.reject(new Error());
    }

    buildCmakeTarget() {
        return Promise.resolve();
    }
};

class FailingCmakeProcessForTargetBuilding implements CmakeProcess {
    checkCmakeVersion() {
        return Promise.resolve("");
    }

    buildCmakeTarget() {
        return Promise.reject(new Error());
    }
}

export function buildFakeCmakeProcess() {
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