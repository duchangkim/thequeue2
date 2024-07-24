import { QueueSlider } from 'components/slider/Slider';
import { QueueFade } from 'model/property';
import { useTranslation } from 'react-i18next';
import { store } from 'store';
import { HistoryActions } from 'store/history';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { ObjectActions } from 'store/object';
import { SettingSelectors } from 'store/settings';

export const ObjectStyleOpacity = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { opacity } = useAppSelector(
    SettingSelectors.firstSelectedObjectFade,
    (prev, next) => {
      return prev.opacity === next.opacity;
    },
  );

  const updateFade = (fade: Partial<QueueFade>): void => {
    const selectedObjects = SettingSelectors.selectedObjects(store.getState());
    dispatch(HistoryActions.Capture());
    dispatch(
      ObjectActions.updateObjects(
        selectedObjects.map((object) => ({
          id: object.id,
          changes: {
            fade: {
              ...object.fade,
              ...fade,
            },
          },
        })),
      ),
    );
  };

  return (
    <div className="tw-flex tw-flex-wrap tw-gap-2">
      <div className="tw-flex-1 tw-basis-full">
        <h2 className="tw-text-xs tw-font-medium tw-leading-snug">
          {t('global.transparency')}
        </h2>
      </div>
      <div className="tw-flex-1 tw-shrink-0 tw-basis-full">
        <QueueSlider
          min={0}
          max={1}
          value={[opacity]}
          step={0.05}
          onValueChange={([e]) =>
            updateFade({
              opacity: e,
            })
          }
        />
      </div>
    </div>
  );
};
