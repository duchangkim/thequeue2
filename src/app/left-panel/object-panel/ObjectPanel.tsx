import { FunctionComponent, memo, ReactNode, useMemo, useState } from 'react';
import clsx from 'clsx';
import styles from './ObjectPanel.module.scss';
import { RemixIconClasses } from 'cdk/icon/factory';
import { createDefaultIcon } from 'model/object/icon';
import AutoSizer from 'react-virtualized-auto-sizer';
import { areEqual, FixedSizeList, ListOnScrollProps } from 'react-window';
import memoize from 'memoize-one';
import * as Tooltip from '@radix-ui/react-tooltip';
import { SvgRemixIcon } from 'cdk/icon/SvgRemixIcon';
import { QueueScrollArea } from 'components/scroll-area/ScrollArea';
import { QueueInput } from 'components/input/Input';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { DocumentSelectors } from 'store/document/selectors';
import { SettingSelectors } from 'store/settings/selectors';
import { useTranslation } from 'react-i18next';
import { QUEUE_UI_SIZE } from 'styles/ui/Size';
import { useCreateFigure } from 'cdk/hooks/useCreateFigure';

export interface QueueObject {
  key: string;
  keyword: string[];
  tooltip?: string;
  factory: () => void;
  preview: React.ReactNode;
}

export interface QueueObjectGroup {
  key: string;
  title: string;
  children: QueueObject[];
}

export interface FlattenQueueObjectGroup {
  type: 'group';
  key: string;
  title: string;
}

export interface FlattenQueueObjectRow {
  type: 'row';
  key: string;
  objects: QueueObject[];
}

export type FlattenData = FlattenQueueObjectGroup | FlattenQueueObjectRow;

export interface FlattenRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    flattenData: FlattenData[];
    closedObjectGroupKey: { [key: string]: boolean };
    toggleOpenedObjectGroup: (key: string) => void;
  };
}

export const FlattenRow: FunctionComponent<FlattenRowProps> = memo(
  ({ style, index, data }) => {
    const flattenData = data.flattenData[index];

    if (flattenData.type === 'group') {
      return (
        <div
          style={style}
          onClick={() => data.toggleOpenedObjectGroup(flattenData.key)}
          className={clsx(styles.objectGroupTitle)}>
          <SvgRemixIcon
            className={styles.objectGroupArrow}
            icon={
              data.closedObjectGroupKey[flattenData.key]
                ? 'ri-arrow-right-s-line'
                : 'ri-arrow-down-s-line'
            }
          />
          {flattenData.title}
        </div>
      );
    }

    return (
      <div className={clsx('tw-flex')} style={style}>
        {flattenData.objects.map((object) => (
          <Tooltip.Provider key={object.key}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div onClick={object.factory} className={clsx(styles.object)}>
                  {object.preview}
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className={styles.TooltipContent}
                  sideOffset={5}>
                  {object.tooltip || object.key}
                  <Tooltip.Arrow className={styles.TooltipArrow} />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        ))}
      </div>
    );
  },
  areEqual,
);

// This helper function memoizes incoming props,
// To avoid causing unnecessary re-renders pure Row components.
// This is only needed since we are passing multiple props with a wrapper object.
// If we were only passing a single, stable value (e.g. items),
// We could just pass the value directly.
const createItemData = memoize(
  (
    flattenData: FlattenData[],
    closedObjectGroupKey: { [key: string]: boolean },
    toggleOpenedObjectGroup: (key: string) => void,
  ) => ({
    flattenData,
    closedObjectGroupKey,
    toggleOpenedObjectGroup,
  }),
);

export const ObjectPanel: FunctionComponent = () => {
  const { t } = useTranslation();
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const dispatch = useAppDispatch();
  const queueDocument = useAppSelector(DocumentSelectors.serialized);
  const settings = useAppSelector(SettingSelectors.settings);
  const createFigure = useCreateFigure(queueDocument, settings, dispatch);
  const [listScrollTopState, setListScrollTopState] = useState(0);

  const [closedObjectGroupKey, setClosedObjectGroupKey] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleOpenedObjectGroup = (key: string): void => {
    setClosedObjectGroupKey({
      ...closedObjectGroupKey,
      [key]: !closedObjectGroupKey[key],
    });
  };

  const createIcon = createFigure(createDefaultIcon);

  const models = useMemo<QueueObjectGroup[]>(
    () => [
      {
        key: 'Remix Icon',
        title: t('global.icon'),
        children: RemixIconClasses.map((iconClassName) => ({
          key: iconClassName,
          factory: () => createIcon(iconClassName),
          keyword: [iconClassName],
          preview: (
            <SvgRemixIcon icon={iconClassName} size={QUEUE_UI_SIZE.XLARGE} />
          ),
        })),
      },
    ],
    [t, createIcon],
  );

  const filteredGroups = useMemo(() => {
    if (searchKeyword === '') {
      return models;
    }
    return models.reduce<QueueObjectGroup[]>((result, group) => {
      const filtered = group.children.filter((child) =>
        child.keyword.some((keyword) =>
          keyword.toLowerCase().includes(searchKeyword.toLowerCase()),
        ),
      );
      if (filtered.length === 0) {
        return result;
      }
      result.push({
        ...group,
        children: filtered,
      });
      return result;
    }, []);
  }, [models, searchKeyword]);

  const flattenItems = useMemo<FlattenData[]>(() => {
    return filteredGroups.reduce<FlattenData[]>((result, group) => {
      result.push({
        type: 'group',
        key: group.key,
        title: group.title,
      });
      if (closedObjectGroupKey[group.key]) {
        return result;
      }
      const rows = group.children.reduce<QueueObject[][]>((result, child) => {
        if (
          !result[result.length - 1] ||
          result[result.length - 1].length >= 4
        ) {
          result.push([]);
        }
        const row = result[result.length - 1];
        row.push(child);
        return result;
      }, []);
      result.push(
        ...rows.map<FlattenQueueObjectRow>((row) => ({
          key: row.map((object) => object.key).join('-'),
          type: 'row',
          objects: row,
        })),
      );
      return result;
    }, []);
  }, [filteredGroups, closedObjectGroupKey]);

  const memoizedItemData = createItemData(
    flattenItems,
    closedObjectGroupKey,
    toggleOpenedObjectGroup,
  );

  const handleScroll = (props: ListOnScrollProps): void => {
    setListScrollTopState(props.scrollOffset);
  };

  return (
    <>
      <div className={clsx(styles.inputContainer)}>
        <QueueInput
          placeholder={t('object-panel.search-shape')}
          className={clsx(styles.input)}
          value={searchKeyword}
          onChange={(e): void => setSearchKeyword(e.target.value)}></QueueInput>
      </div>
      <QueueScrollArea.Root className={clsx(styles.ScrollAreaRoot)}>
        <QueueScrollArea.Viewport className={clsx(styles.ScrollAreaViewport)}>
          <AutoSizer>
            {({ height, width }): ReactNode => (
              <FixedSizeList
                itemCount={flattenItems.length}
                itemSize={50}
                width={width}
                height={height}
                itemKey={(index): string => flattenItems[index].key}
                itemData={memoizedItemData}
                initialScrollOffset={listScrollTopState}
                onScroll={handleScroll}>
                {FlattenRow}
              </FixedSizeList>
            )}
          </AutoSizer>
        </QueueScrollArea.Viewport>
        <QueueScrollArea.Scrollbar orientation="vertical">
          <QueueScrollArea.Thumb />
        </QueueScrollArea.Scrollbar>
        <QueueScrollArea.Scrollbar orientation="horizontal">
          <QueueScrollArea.Thumb />
        </QueueScrollArea.Scrollbar>
        <QueueScrollArea.Corner />
      </QueueScrollArea.Root>
    </>
  );
};
