import { QueueH6 } from 'components/head/Head';
import { QueueInput } from 'components/input/Input';
import { QueueRect } from 'model/property';
import { useTranslation } from 'react-i18next';
import { HistoryActions } from 'store/history';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { ObjectActions } from 'store/object';
import { SettingSelectors } from 'store/settings';
import styles from './Rect.module.scss';

export const ObjectStyleRect = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const selectedObjects = useAppSelector(SettingSelectors.selectedObjects);
  const [firstObject] = selectedObjects;

  const rect = firstObject.rect;

  const updateRect = (rect: Partial<QueueRect>): void => {
    dispatch(HistoryActions.Capture());
    dispatch(
      ObjectActions.updateObjects(
        selectedObjects.map((object) => ({
          id: object.id,
          changes: {
            rect: {
              ...object.rect,
              ...rect,
            },
          },
        })),
      ),
    );
  };

  return (
    <div className={styles.ItemContainer}>
      <QueueH6>{t('styler.size-and-position')}</QueueH6>
      <div className={styles.SubItemContainer}>
        <div className={styles.SubTitle}>X</div>
        <div className={styles.SubInputContainer}>
          <QueueInput
            value={rect.x}
            type="number"
            onChange={(e): void => updateRect({ x: Number(e.target.value) })}
          />
        </div>
      </div>
      <div className={styles.SubItemContainer}>
        <div className={styles.SubTitle}>Y</div>
        <div className={styles.SubInputContainer}>
          <QueueInput
            value={rect.y}
            type="number"
            onChange={(e): void => updateRect({ y: Number(e.target.value) })}
          />
        </div>
      </div>
      <div className={styles.SubItemContainer}>
        <div className={styles.SubTitle}>{t('global.width')}</div>
        <div className={styles.SubInputContainer}>
          <QueueInput
            value={rect.width}
            type="number"
            onChange={(e): void =>
              updateRect({ width: Number(e.target.value) })
            }
          />
        </div>
      </div>
      <div className={styles.SubItemContainer}>
        <div className={styles.SubTitle}>{t('global.height')}</div>
        <div className={styles.SubInputContainer}>
          <QueueInput
            value={rect.height}
            type="number"
            onChange={(e): void =>
              updateRect({ height: Number(e.target.value) })
            }
          />
        </div>
      </div>
    </div>
  );
};
