export interface PitchCoordinates {
  x: number | null;
  y: number | null;
}

export interface PitchSegment {
  x: number | null;
  y: number | null;
  endX: number | null;
  endY: number | null;
}

export interface PitchPoint {
  x: number;
  y: number;
}

const PITCH_LENGTH = 112;
const PITCH_WIDTH = 80;
const HALF_LENGTH = PITCH_LENGTH / 2;
const HALF_WIDTH = PITCH_WIDTH / 2;

export function mirrorPoint(point: PitchCoordinates): PitchCoordinates {
  return {
    x: point.x === null ? null : -point.x,
    y: point.y === null ? null : -point.y,
  };
}

export function mirrorSegment(segment: PitchSegment): PitchSegment {
  return {
    x: segment.x === null ? null : -segment.x,
    y: segment.y === null ? null : -segment.y,
    endX: segment.endX === null ? null : -segment.endX,
    endY: segment.endY === null ? null : -segment.endY,
  };
}

export function orientPointToAttackingRight(point: PitchCoordinates): PitchCoordinates {
  if ((point.x ?? 0) < 0) {
    return mirrorPoint(point);
  }

  return point;
}

export function orientSegmentToAttackingRight(segment: PitchSegment): PitchSegment {
  const referenceX = segment.endX ?? segment.x ?? 0;

  if (referenceX < 0) {
    return mirrorSegment(segment);
  }

  return segment;
}

export function orientPointToTeamGoal(point: PitchCoordinates, team?: string | null): PitchCoordinates {
  const teamGoal = getTeamGoalDirection(team);
  const x = point.x ?? 0;

  if (teamGoal === "right" && x < 0) {
    return mirrorPoint(point);
  }

  if (teamGoal === "left" && x > 0) {
    return mirrorPoint(point);
  }

  return point;
}

export function orientSegmentToTeamGoal(segment: PitchSegment, team?: string | null): PitchSegment {
  const teamGoal = getTeamGoalDirection(team);
  const referenceX = segment.endX ?? segment.x ?? 0;

  if (teamGoal === "right" && referenceX < 0) {
    return mirrorSegment(segment);
  }

  if (teamGoal === "left" && referenceX > 0) {
    return mirrorSegment(segment);
  }

  return segment;
}

export function toPitchPoint(point: PitchCoordinates): PitchPoint {
  return {
    x: Math.max(0, Math.min(PITCH_LENGTH, (point.x ?? 0) + HALF_LENGTH)),
    y: Math.max(0, Math.min(PITCH_WIDTH, (point.y ?? 0) + HALF_WIDTH)),
  };
}

function getTeamGoalDirection(team?: string | null): "left" | "right" {
  if (team === "FCK" || team === "FC København" || team === "FC Kobenhavn") {
    return "left";
  }

  return "right";
}
