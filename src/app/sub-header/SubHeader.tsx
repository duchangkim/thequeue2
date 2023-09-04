import { fitScreenSizeEvent } from 'app/events/event';
import { useEventDispatch } from 'cdk/hooks/event-dispatcher';
import clsx from 'clsx';
import { QueueScrollArea } from 'components/scroll-area/ScrollArea';
import { QueueSeparator } from 'components/separator/Separator';
import { QueueIconButton } from 'components/buttons/button/Button';
import styles from './SubHeader.module.scss';
import { SettingSelectors } from 'store/settings/selectors';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { SettingsActions } from 'store/settings/actions';
import { HistoryActions } from 'store/history';
import { HistorySelectors } from 'store/history/selectors';
import { ObjectActions } from 'store/object';
import { QUEUE_UI_SIZE } from 'styles/ui/Size';
import { ReactComponent as CopyIcon } from 'assets/icons/copy.svg';
import { ReactComponent as CornerUpLeftIcon } from 'assets/icons/corner-up-left.svg';
import { ReactComponent as CornerUpRightIcon } from 'assets/icons/corner-up-right.svg';
import { ReactComponent as ImageIcon } from 'assets/icons/image.svg';
import { ReactComponent as PrinterIcon } from 'assets/icons/printer.svg';
import { ReactComponent as SaveIcon } from 'assets/icons/save.svg';
import { ReactComponent as SearchIcon } from 'assets/icons/search.svg';
import { ReactComponent as ShareIcon } from 'assets/icons/share-2.svg';
import { ReactComponent as SidebarIcon } from 'assets/icons/sidebar.svg';
import { ReactComponent as TableIcon } from 'assets/icons/table.svg';
import { ReactComponent as TypeIcon } from 'assets/icons/type.svg';
import { memo, useMemo, useState } from 'react';
import { QueueDropdown } from 'components';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { useCreateImage } from 'cdk/hooks/useCreateFigure';
import QueueRectAddLayer from 'app/sub-header/RectAddLayer/RectAddLayer';
import QueueLineAddLayer from 'app/sub-header/LineAddLayer/LineAddLayer';
import IconAddLayer from './IconAddLayer/IconAddLayer';
import { batch } from 'react-redux';
import { store } from 'store';

const QueueSubHeader = memo(() => {
  const dispatch = useAppDispatch();
  const eventDispatch = useEventDispatch();
  const { t } = useTranslation();

  const hasSelectedObject = useAppSelector(SettingSelectors.hasSelectedObject);
  const history = useAppSelector(HistorySelectors.all);
  const currentQueueIndex = useAppSelector(SettingSelectors.queueIndex);
  const currentPageId = useAppSelector(SettingSelectors.pageId);
  const scale = Math.floor(useAppSelector(SettingSelectors.scale) * 100);

  const leftPanelOpened = useAppSelector(SettingSelectors.leftPanelOpened);
  const bottomPanelOpened = useAppSelector(SettingSelectors.bottomPanelOpened);

  const [isDropdownOpen, setIsDropdownOpen] = useState({
    sidebar: false,
    text: false,
    image: false,
    rect: false,
    share: false,
  });

  const createImage = useCreateImage(
    currentPageId,
    currentQueueIndex,
    dispatch,
  );

  return (
    <QueueScrollArea.Root className={styles.Container}>
      <QueueScrollArea.Viewport>
        <div className={styles.ItemRoot}>
          <div className={styles.ItemGroup}>
            <div className={styles.ItemGroup}>
              <QueueDropdown
                open={isDropdownOpen.sidebar}
                onOpenChange={() =>
                  setIsDropdownOpen({
                    ...isDropdownOpen,
                    sidebar: !isDropdownOpen.sidebar,
                  })
                }>
                <QueueDropdown.Trigger>
                  <div className="tw-flex tw-items-center tw-p-3 tw-gap-1">
                    <SidebarIcon />
                    <ChevronDownIcon
                      className={clsx(
                        'tw-w-3',
                        'tw-h-3',
                        'tw-transition-all',
                        'tw-duration-300',
                        {
                          'tw-scale-y-[1]': !isDropdownOpen.sidebar,
                          'tw-scale-y-[-1]': isDropdownOpen.sidebar,
                        },
                      )}
                    />
                  </div>
                </QueueDropdown.Trigger>

                <QueueDropdown.Content>
                  <QueueDropdown.Item
                    onClick={() =>
                      dispatch(
                        SettingsActions.updateSettings({
                          changes: {
                            leftPanelOpened: !leftPanelOpened,
                          },
                        }),
                      )
                    }>
                    왼쪽 사이드바 닫기-번역
                  </QueueDropdown.Item>
                  <QueueDropdown.Item
                    onClick={() =>
                      dispatch(
                        SettingsActions.updateSettings({
                          changes: {
                            bottomPanelOpened: !bottomPanelOpened,
                          },
                        }),
                      )
                    }>
                    타임라인 닫기-번역
                  </QueueDropdown.Item>
                </QueueDropdown.Content>
              </QueueDropdown>

              <QueueSeparator.Root
                orientation="vertical"
                decorative
                className={styles.Separator}
              />
            </div>

            <div className={styles.ItemGroup}>
              {/* undo */}
              <QueueIconButton
                size={QUEUE_UI_SIZE.MEDIUM}
                onClick={() => dispatch(HistoryActions.Undo())}
                disabled={!history.previous.length}>
                <CornerUpLeftIcon />
              </QueueIconButton>

              {/* redo */}
              <QueueIconButton
                size={QUEUE_UI_SIZE.MEDIUM}
                onClick={() => dispatch(HistoryActions.Redo())}
                disabled={!history.future.length}>
                <CornerUpRightIcon />
              </QueueIconButton>

              <QueueSeparator.Root
                orientation="vertical"
                decorative
                className={styles.Separator}
              />
            </div>

            <div className={styles.ItemGroup}>
              <QueueIconButton
                size={QUEUE_UI_SIZE.MEDIUM}
                onClick={() => {
                  const selectedObjectIds = SettingSelectors.selectedObjectIds(
                    store.getState(),
                  );
                  batch(() => {
                    dispatch(HistoryActions.Capture());
                    dispatch(
                      ObjectActions.duplicate({
                        ids: selectedObjectIds,
                      }),
                    );
                  });
                }}
                disabled={!hasSelectedObject}>
                <TypeIcon />
              </QueueIconButton>

              <QueueIconButton
                size={QUEUE_UI_SIZE.MEDIUM}
                onClick={() => createImage()}>
                <ImageIcon />
              </QueueIconButton>

              <QueueDropdown
                open={isDropdownOpen.rect}
                onOpenChange={() =>
                  setIsDropdownOpen({
                    ...isDropdownOpen,
                    rect: !isDropdownOpen.rect,
                  })
                }>
                <QueueDropdown.Trigger>
                  <div className="tw-flex tw-items-center tw-p-3 tw-gap-1">
                    <CopyIcon />
                    <ChevronDownIcon
                      className={clsx(
                        'tw-w-3',
                        'tw-h-3',
                        'tw-transition-all',
                        'tw-duration-300',
                        {
                          'tw-scale-y-[1]': !isDropdownOpen.rect,
                          'tw-scale-y-[-1]': isDropdownOpen.rect,
                        },
                      )}
                    />
                  </div>
                </QueueDropdown.Trigger>

                <QueueDropdown.Content>
                  <QueueDropdown.Sub>
                    <QueueDropdown.SubTrigger className="tw-py-2 tw-px-6">
                      {t('global.shape')}
                    </QueueDropdown.SubTrigger>
                    <QueueDropdown.SubContent>
                      <QueueScrollArea.Root className="">
                        <QueueScrollArea.Viewport className=""></QueueScrollArea.Viewport>
                        <QueueRectAddLayer />
                        <QueueScrollArea.Scrollbar orientation="vertical">
                          <QueueScrollArea.Thumb />
                        </QueueScrollArea.Scrollbar>
                        <QueueScrollArea.Scrollbar orientation="horizontal">
                          <QueueScrollArea.Thumb />
                        </QueueScrollArea.Scrollbar>
                        <QueueScrollArea.Corner />
                      </QueueScrollArea.Root>
                    </QueueDropdown.SubContent>
                  </QueueDropdown.Sub>

                  <QueueDropdown.Sub>
                    <QueueDropdown.SubTrigger className="tw-py-2 tw-px-6">
                      {t('global.line')}
                    </QueueDropdown.SubTrigger>
                    <QueueDropdown.SubContent>
                      <QueueScrollArea.Root className="">
                        <QueueScrollArea.Viewport className=""></QueueScrollArea.Viewport>
                        <QueueLineAddLayer />
                        <QueueScrollArea.Scrollbar orientation="vertical">
                          <QueueScrollArea.Thumb />
                        </QueueScrollArea.Scrollbar>
                        <QueueScrollArea.Scrollbar orientation="horizontal">
                          <QueueScrollArea.Thumb />
                        </QueueScrollArea.Scrollbar>
                        <QueueScrollArea.Corner />
                      </QueueScrollArea.Root>
                    </QueueDropdown.SubContent>
                  </QueueDropdown.Sub>

                  <QueueDropdown.Sub>
                    <QueueDropdown.SubTrigger className="tw-py-2 tw-px-6">
                      {t('global.icon')}
                    </QueueDropdown.SubTrigger>
                    <QueueDropdown.SubContent>
                      <IconAddLayer />
                    </QueueDropdown.SubContent>
                  </QueueDropdown.Sub>
                </QueueDropdown.Content>
              </QueueDropdown>

              <QueueIconButton
                size={QUEUE_UI_SIZE.MEDIUM}
                onClick={() => {
                  const selectedObjectIds = SettingSelectors.selectedObjectIds(
                    store.getState(),
                  );
                  batch(() => {
                    dispatch(HistoryActions.Capture());
                    dispatch(
                      ObjectActions.duplicate({
                        ids: selectedObjectIds,
                      }),
                    );
                  });
                }}
                disabled={!hasSelectedObject}>
                <ShareIcon />
              </QueueIconButton>

              <QueueIconButton
                size={QUEUE_UI_SIZE.MEDIUM}
                onClick={() => {
                  const selectedObjectIds = SettingSelectors.selectedObjectIds(
                    store.getState(),
                  );
                  batch(() => {
                    dispatch(HistoryActions.Capture());
                    dispatch(
                      ObjectActions.duplicate({
                        ids: selectedObjectIds,
                      }),
                    );
                  });
                }}
                disabled={!hasSelectedObject}>
                <TableIcon />
              </QueueIconButton>
            </div>
          </div>

          <div className={clsx(styles.ItemGroup, 'tw-gap-2')}>
            <QueueIconButton
              size={QUEUE_UI_SIZE.MEDIUM}
              onClick={() => {
                eventDispatch(fitScreenSizeEvent());
              }}
              style={{ width: 'unset' }}>
              <SearchIcon />
              <span
                className={clsx('tw-text-black-900', 'tw-text-14', 'tw-mx-1')}>
                {scale}%
              </span>
            </QueueIconButton>

            <QueueIconButton
              size={QUEUE_UI_SIZE.MEDIUM}
              onClick={() => {
                const selectedObjectIds = SettingSelectors.selectedObjectIds(
                  store.getState(),
                );
                batch(() => {
                  dispatch(HistoryActions.Capture());
                  dispatch(ObjectActions.duplicate({ ids: selectedObjectIds }));
                });
              }}
              disabled={!hasSelectedObject}>
              <PrinterIcon />
            </QueueIconButton>

            <QueueIconButton
              size={QUEUE_UI_SIZE.MEDIUM}
              onClick={() => {
                const selectedObjectIds = SettingSelectors.selectedObjectIds(
                  store.getState(),
                );
                batch(() => {
                  dispatch(HistoryActions.Capture());
                  dispatch(ObjectActions.duplicate({ ids: selectedObjectIds }));
                });
              }}
              disabled={!hasSelectedObject}>
              <SaveIcon />
            </QueueIconButton>

            {/* <QueueIconButton
              size={QUEUE_UI_SIZE.MEDIUM}
              onClick={() => eventDispatch(fitScreenSizeEvent())}>
              <SvgRemixIcon icon={'ri-fullscreen-fill'} />
            </QueueIconButton> */}
            {/* <QueueIconButton
              size={QUEUE_UI_SIZE.MEDIUM}
              onClick={() => dispatch(SettingsActions.decreaseScale())}>
              <SvgRemixIcon icon={'ri-subtract-line'} />
            </QueueIconButton>
            <QueueIconButton
              size={QUEUE_UI_SIZE.MEDIUM}
              onClick={() => dispatch(SettingsActions.increaseScale())}>
              <SvgRemixIcon icon={'ri-add-line'} />
            </QueueIconButton> */}
          </div>
        </div>
      </QueueScrollArea.Viewport>
      <QueueScrollArea.Scrollbar orientation="horizontal" hidden>
        <QueueScrollArea.Thumb />
      </QueueScrollArea.Scrollbar>
    </QueueScrollArea.Root>
  );
});

export default QueueSubHeader;
