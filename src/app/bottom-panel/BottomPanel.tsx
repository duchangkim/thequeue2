import clsx from 'clsx';
import { QueueIconButton } from 'components/button/Button';
import { useState } from 'react';
import { QueueContextMenu } from 'components/context-menu/Context';
import styles from './BottomPanel.module.scss';
import { QueueToggleGroup } from 'components/toggle-group/ToggleGroup';
import { EditPageNameDialog } from 'app/dialogs/EditPageNameDialog';
import { QueueAlertDialog } from 'components/alert-dialog/AlertDialog';
import { SvgRemixIcon } from 'cdk/icon/SvgRemixIcon';
import { QueueScrollArea } from 'components/scroll-area/ScrollArea';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { EntityId, nanoid } from '@reduxjs/toolkit';
import { PageSelectors } from 'store/page/selectors';
import { DocumentSelectors } from 'store/document/selectors';
import { PageActions } from '../../store/page';
import { SettingsActions, SettingSelectors } from '../../store/settings';
import { HistoryActions } from 'store/history';
import { useTranslation } from 'react-i18next';
import { QUEUE_UI_SIZE } from 'styles/ui/Size';
import { QUEUE_UI_COLOR } from 'styles/ui/Color';
import { Timeline } from 'components/timeline/Timeline';

export const BottomPanel = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(SettingSelectors.settings);
  const document = useAppSelector(DocumentSelectors.document);
  const pages = useAppSelector(PageSelectors.all);

  const [dragOverIndex, setDragOverIndex] = useState(-1);
  const [editNamePageId, setEditNamePageId] = useState<EntityId>('');
  const [deleteConfirmPageId, setDeleteConfirmPageId] = useState<EntityId>('');

  const setQueuePageIndex = (id: EntityId): void => {
    dispatch(
      SettingsActions.setSettings({
        ...settings,
        pageId: id,
        queueIndex: 0,
        queueStart: -1,
        queuePosition: 'pause',
        selectedObjectIds: [],
        selectionMode: 'normal',
      }),
    );
  };

  const navigatePage = (id: string): void => {
    setQueuePageIndex(id);
  };

  const movePage = (from: EntityId, to: EntityId): void => {
    dispatch(HistoryActions.Capture());
    dispatch(
      PageActions.switchPageIndex({
        from: from,
        to: to,
      }),
    );
  };

  const createPage = (index: number): void => {
    dispatch(HistoryActions.Capture());
    const newId = nanoid();
    dispatch(
      PageActions.addPage({
        documentId: document.id,
        id: newId,
        index,
        pageName: `Page-${pages.length + 1}`,
      }),
    );
    setQueuePageIndex(newId);
  };

  const removePage = (id: EntityId): void => {
    dispatch(HistoryActions.Capture());
    const index = pages.findIndex((page) => page.id === id);
    dispatch(PageActions.removePage(id));
    const sliced = pages.slice(0).filter((page) => page.id !== id);
    setQueuePageIndex(sliced[index]?.id || sliced[sliced.length - 1]?.id);
  };

  const onDragStart = (e: React.DragEvent<HTMLSpanElement>, id: EntityId): void => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${id}`);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>): boolean => {
    e.preventDefault();
    return false;
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    const from = e.dataTransfer.getData('text/plain') as string;
    if (!e.currentTarget || !e.currentTarget.classList.contains('page-item')) {
      return;
    }
    const to = e.currentTarget.getAttribute('data-id') as string;
    movePage(from, to);
  };

  const onPageNameEdit = (pageName: string, id: EntityId): void => {
    dispatch(HistoryActions.Capture());
    dispatch(
      PageActions.updatePage({
        id: id,
        changes: {
          pageName: pageName.trim(),
        },
      }),
    );
    setEditNamePageId('');
  };

  const onPageCopy = (index: number): void => {
    dispatch(HistoryActions.Capture());
    const newId = nanoid();
    dispatch(
      PageActions.copyPage({
        fromId: pages[index].id,
        index: index,
        newId: newId,
      }),
    );
  };

  const onPageDeleteSubmit = (id: EntityId): void => {
    removePage(id);
    setDeleteConfirmPageId('');
  };

  return (
    <div className="tw-rounded-t-lg tw-bg-white tw-h-full">
      <Timeline></Timeline>
      <div className={clsx(styles.container)}>
        <div className={clsx(styles.pageHolder)}>
          <QueueToggleGroup.Root
            type="single"
            value={`${settings.pageId}`}
            onValueChange={(value): void => navigatePage(value)}>
            <QueueScrollArea.Root>
              <QueueScrollArea.Viewport>
                <div className={clsx(styles.Pages)}>
                  {pages.map((page, index, self) => (
                    <QueueContextMenu.Root key={index}>
                      <QueueContextMenu.Trigger
                        className={clsx('page-item', dragOverIndex === index && styles.dragOver)}
                        draggable="true"
                        data-id={page.id}
                        onDragStart={(e): void => onDragStart(e, page.id)}
                        onDragEnter={(): void => setDragOverIndex(index)}
                        onDragEnd={(): void => setDragOverIndex(-1)}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        onDoubleClick={(): void => setEditNamePageId(page.id)}>
                        <QueueToggleGroup.Item value={`${page.id}`} size={QUEUE_UI_SIZE.MEDIUM}>
                          {page.pageName}
                        </QueueToggleGroup.Item>
                      </QueueContextMenu.Trigger>
                      <QueueContextMenu.Portal>
                        <QueueContextMenu.Content>
                          <QueueContextMenu.Item
                            onClick={(): void => movePage(page.id, self[Math.max(index - 1, 0)].id)}>
                            {t('bottom-panel.move-page-to-left')}
                          </QueueContextMenu.Item>
                          <QueueContextMenu.Item
                            onClick={(): void => movePage(page.id, self[Math.min(index + 1, self.length - 1)].id)}>
                            {t('bottom-panel.move-page-to-right')}
                          </QueueContextMenu.Item>
                          <QueueContextMenu.Separator />
                          <QueueContextMenu.Item onClick={(): void => createPage(Math.max(index - 1))}>
                            {t('bottom-panel.add-page-to-left')}
                          </QueueContextMenu.Item>
                          <QueueContextMenu.Item onClick={(): void => createPage(Math.min(index, self.length))}>
                            {t('bottom-panel.add-page-to-right')}
                          </QueueContextMenu.Item>
                          <QueueContextMenu.Separator />
                          <QueueContextMenu.Item onClick={(): void => onPageCopy(index)}>
                            {t('global.duplicate')}
                          </QueueContextMenu.Item>
                          <QueueContextMenu.Item onClick={(): void => setEditNamePageId(page.id)}>
                            {t('global.rename')}
                          </QueueContextMenu.Item>
                          {pages.length >= 2 && (
                            <>
                              <QueueContextMenu.Separator />
                              <QueueContextMenu.Item
                                className={styles.Remove}
                                onClick={(): void => setDeleteConfirmPageId(page.id)}>
                                {t('global.delete')}
                              </QueueContextMenu.Item>
                            </>
                          )}
                        </QueueContextMenu.Content>
                      </QueueContextMenu.Portal>
                    </QueueContextMenu.Root>
                  ))}
                </div>
              </QueueScrollArea.Viewport>
              <QueueScrollArea.Scrollbar orientation="horizontal" hidden>
                <QueueScrollArea.Thumb />
              </QueueScrollArea.Scrollbar>
            </QueueScrollArea.Root>
          </QueueToggleGroup.Root>
        </div>
        <div>
          <QueueIconButton onClick={(): void => createPage(pages.length)}>
            <SvgRemixIcon icon="ri-add-fill" />
          </QueueIconButton>
        </div>

        {/* 페이지 삭제 확인 다이얼로그 */}
        {deleteConfirmPageId && (
          <QueueAlertDialog.Root
            open={!!deleteConfirmPageId}
            onOpenChange={(opened): void => !opened && setDeleteConfirmPageId('')}>
            <QueueAlertDialog.Overlay />
            <QueueAlertDialog.Content>
              <QueueAlertDialog.Title>페이지 삭제</QueueAlertDialog.Title>
              <QueueAlertDialog.Description>페이지를 삭제하시겠습니까?</QueueAlertDialog.Description>
              <QueueAlertDialog.Footer>
                <QueueAlertDialog.Cancel size={QUEUE_UI_SIZE.MEDIUM} color={QUEUE_UI_COLOR.RED}>
                  취소
                </QueueAlertDialog.Cancel>
                <QueueAlertDialog.Action
                  size={QUEUE_UI_SIZE.MEDIUM}
                  color={QUEUE_UI_COLOR.BLUE}
                  onClick={(): void => onPageDeleteSubmit(deleteConfirmPageId)}>
                  확인
                </QueueAlertDialog.Action>
              </QueueAlertDialog.Footer>
            </QueueAlertDialog.Content>
          </QueueAlertDialog.Root>
        )}

        {/* 페이지 이름 수정 다이얼로그 */}
        {editNamePageId && (
          <EditPageNameDialog
            open={!!editNamePageId}
            onOpenChange={(opened): void => !opened && setEditNamePageId('')}
            pageName={pages.find((page) => page.id === editNamePageId).pageName}
            onSubmit={(value): void => onPageNameEdit(value, editNamePageId)}
          />
        )}
      </div>
    </div>
  );
};
