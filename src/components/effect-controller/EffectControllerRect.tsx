import { MoveEffect } from 'model/effect';
import { QueueRect } from 'model/property';
import { ReactElement } from 'react';
import { selectObjectQueueEffects } from 'store/document/selectors';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { objectsSlice } from 'store/object/object.reducer';
import { selectSettings } from 'store/settings/selectors';

export const EffectControllerRect = (): ReactElement => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettings);
  const effects = useAppSelector(selectObjectQueueEffects(settings.queuePage, settings.queueIndex));

  const firstObjectRectEffect = effects[settings.selectedObjectUUIDs[0]].rect;

  const handleCurrentRectChange = (rect: Partial<QueueRect>): void => {
    settings.selectedObjectUUIDs.forEach((objectUUID) => {
      const nextEffect: MoveEffect = {
        ...effects[objectUUID].rect,
        index: settings.queueIndex,
        rect: {
          ...effects[objectUUID].rect.rect,
          ...rect,
        },
      };

      dispatch(
        objectsSlice.actions.setObjectQueueEffects({
          page: settings.queuePage,
          queueIndex: settings.queueIndex,
          effects: {
            ...effects,
            [objectUUID]: {
              ...effects[objectUUID],
              rect: nextEffect,
            },
          },
        }),
      );
    });
  };

  return (
    <div>
      <p className="text-sm">width</p>
      <div className="flex items-center gap-2">
        <input
          className="w-full"
          type="number"
          value={firstObjectRectEffect.rect.width}
          onChange={(e): void => handleCurrentRectChange({ width: parseInt(e.currentTarget.value) })}
        />
      </div>
      <p className="text-sm">height</p>
      <div className="flex items-center gap-2">
        <input
          className="w-full"
          type="number"
          value={firstObjectRectEffect.rect.height}
          onChange={(e): void => handleCurrentRectChange({ height: parseInt(e.currentTarget.value) })}
        />
      </div>
      <p className="text-sm">x</p>
      <div className="flex items-center gap-2">
        <input
          className="w-full"
          type="number"
          value={firstObjectRectEffect.rect.x}
          onChange={(e): void => handleCurrentRectChange({ x: parseInt(e.currentTarget.value) })}
        />
      </div>
      <p className="text-sm">y</p>
      <div className="flex items-center gap-2">
        <input
          className="w-full"
          type="number"
          value={firstObjectRectEffect.rect.y}
          onChange={(e): void => handleCurrentRectChange({ y: parseInt(e.currentTarget.value) })}
        />
      </div>
    </div>
  );
};
