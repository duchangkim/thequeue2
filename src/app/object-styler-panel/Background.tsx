import { EntityId } from '@reduxjs/toolkit';
import { QueueFill } from 'model/property';
import { useTranslation } from 'react-i18next';
import { HistoryActions } from 'store/history';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { ObjectActions } from 'store/object';
import { SettingSelectors } from 'store/settings';
import { QueueObjectType } from 'model/object';
import { supportFillAll } from 'model/support';
import QueueColorPicker from 'components/color-picker/ColorPicker';
import { QueueSeparator } from 'components/separator/Separator';
import { QueueInput } from 'components/input/Input';

export const ObjectStyleBackground = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const selectedObjects = useAppSelector(SettingSelectors.selectedObjects);

  if (!supportFillAll(selectedObjects)) {
    return null;
  }

  const [firstObject] = selectedObjects;
  const fill = firstObject.fill;

  const updateObjectFill = (fill: Partial<QueueFill>) => {
    dispatch(HistoryActions.Capture());
    dispatch(
      ObjectActions.updateObjects(
        selectedObjects.map<{
          id: EntityId;
          changes: Partial<QueueObjectType>;
        }>((object) => {
          return {
            id: object.id,
            changes: {
              fill: {
                ...object.fill,
                ...fill,
              },
            },
          };
        }),
      ),
    );
  };

  return (
    <div className="tw-flex tw-flex-wrap tw-gap-2">
      <div className="tw-flex-1 tw-basis-full">
        <h2 className="tw-text-xs tw-font-medium tw-leading-snug">
          {t('global.fill-color')}
        </h2>
      </div>

      <div className="tw-flex-1 tw-basis-full">
        <div className="tw-flex tw-gap-2 tw-items-center tw-px-2 tw-py-1.5 tw-box-border tw-bg-[#E7E6EB] tw-leading-none tw-text-xs tw-font-normal tw-rounded-lg tw-h-[34px]">
          <div className="tw-flex tw-items-center tw-gap-2">
            <QueueColorPicker
              color={fill.color}
              onChange={(color) => {
                updateObjectFill({ color: color.hex });
              }}
            />
            <div className="tw-flex-1">{fill.color.replace('#', '')}</div>
          </div>
          <QueueSeparator.Root className="tw-h-4" orientation="vertical" />
          <div className="tw-flex tw-items-center tw-basis-3/5">
            <QueueInput
              className="tw-p-0 tw-font-normal"
              type="number"
              value={fill.opacity * 100}
              onChange={(event) => {
                updateObjectFill({
                  opacity: Number(event.target.value) / 100,
                });
              }}
            />
            %
          </div>
        </div>
      </div>
    </div>
  );
};
