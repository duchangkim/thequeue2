import { EntityId } from '@reduxjs/toolkit';
import {
  QueueFade,
  QueueFill,
  QueueRect,
  QueueRotate,
  QueueScale,
  QueueStroke,
} from 'model/property';

export interface StandaloneCircleObject {
  objectId: EntityId;
  rect: QueueRect;
  stroke: QueueStroke;
  rotate: QueueRotate;
  fade: QueueFade;
  scale: QueueScale;
  fill: QueueFill;
}
