import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Copy, Check, X, TestTube, ExternalLink, Clock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useWorkspace } from '../../hooks/useWorkspace';
import {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  getWebhookLogs,
  triggerWebhooks,
  generateWebhookSecret,
  startWebhookRetryWorker,
  stopWebhookRetryWorker,
} from '../../lib/integrations/webhooks';
import { WebhookConfig, WebhookEventType, WebhookDeliveryLog } from '../../types/webhook';
import { useToast } from '../../hooks/use-toast';

const WEBHOOK_EVENTS: { value: WebhookEventType; label: string }[] = [
  { value: 'page.created', label: 'Page Created' },
  { value: 'page.updated', label: 'Page Updated' },
  { value: 'page.deleted', label: 'Page Deleted' },
  { value: 'block.created', label: 'Block Created' },
  { value: 'block.updated', label: 'Block Updated' },
  { value: 'block.deleted', label: 'Block Deleted' },
];

export const WebhookManager = () => {
  const { workspace } = useWorkspace();
  const { toast } = useToast();

  // Debug logging
  console.log('[WebhookManager] Rendering, workspace:', workspace?.id);

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [logs, setLogs] = useState<WebhookDeliveryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'webhooks' | 'logs'>('webhooks');
  const [copiedSecret, setCopiedSecret] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as WebhookEventType[],
    secret: '',
    enabled: true,
  });

  useEffect(() => {
    if (workspace?.id) {
      console.log('[WebhookManager] useEffect: Loading webhooks and logs', { workspaceId: workspace.id });
      loadWebhooks();
      loadLogs();
      startWebhookRetryWorker(workspace.id);
    }

    return () => {
      stopWebhookRetryWorker();
    };
  }, [workspace?.id]);

  // Refresh logs periodically
  useEffect(() => {
    if (workspace?.id && activeTab === 'logs') {
      const interval = setInterval(() => {
        console.log('[WebhookManager] Auto-refreshing logs');
        loadLogs();
      }, 5000); // Refresh every 5 seconds when on logs tab
      return () => clearInterval(interval);
    }
  }, [workspace?.id, activeTab]);

  const loadWebhooks = async () => {
    if (!workspace?.id) return;
    try {
      const data = await getWebhooks(workspace.id);
      setWebhooks(data);
    } catch (error) {
      console.error('Error loading webhooks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load webhooks',
        variant: 'destructive',
      });
    }
  };

  const loadLogs = async () => {
    if (!workspace?.id) {
      console.log('[WebhookManager] loadLogs: No workspace ID');
      return;
    }
    console.log('[WebhookManager] loadLogs called', { workspaceId: workspace.id });
    try {
      const data = await getWebhookLogs(workspace.id, 100);
      console.log('[WebhookManager] loadLogs: Received', data.length, 'logs');
      setLogs(data);
    } catch (error) {
      console.error('[WebhookManager] Error loading logs:', error);
    }
  };

  const handleCreate = async () => {
    if (!workspace?.id || !formData.name || !formData.url || formData.events.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const secret = formData.secret || generateWebhookSecret();
      await createWebhook(workspace.id, {
        name: formData.name,
        url: formData.url,
        events: formData.events,
        secret,
        enabled: formData.enabled,
      });
      await loadWebhooks();
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Webhook created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create webhook',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!workspace?.id || !editingWebhook) return;

    setLoading(true);
    try {
      await updateWebhook(workspace.id, editingWebhook.id, {
        name: formData.name,
        url: formData.url,
        events: formData.events,
        secret: formData.secret || editingWebhook.secret,
        enabled: formData.enabled,
      });
      await loadWebhooks();
      setEditingWebhook(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Webhook updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update webhook',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!workspace?.id) return;
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      await deleteWebhook(workspace.id, webhookId);
      await loadWebhooks();
      toast({
        title: 'Success',
        description: 'Webhook deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete webhook',
        variant: 'destructive',
      });
    }
  };

  const handleToggleEnabled = async (webhook: WebhookConfig) => {
    if (!workspace?.id) return;
    try {
      await updateWebhook(workspace.id, webhook.id, { enabled: !webhook.enabled });
      await loadWebhooks();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update webhook',
        variant: 'destructive',
      });
    }
  };

  const handleTest = async (webhook: WebhookConfig) => {
    if (!workspace?.id) {
      console.error('[WebhookManager] handleTest: No workspace ID');
      return;
    }
    console.log('[WebhookManager] handleTest called', { webhookId: webhook.id, workspaceId: workspace.id });
    setLoading(true);
    try {
      console.log('[WebhookManager] Calling triggerWebhooks for test');
      await triggerWebhooks(workspace.id, 'webhook.test', {
        event: 'webhook.test',
        workspaceId: workspace.id,
        timestamp: Date.now(),
        data: {
          message: 'This is a test webhook from WorkLin',
          webhookId: webhook.id,
          webhookName: webhook.name,
        },
      });
      console.log('[WebhookManager] Test webhook triggered, reloading logs');
      // Wait a bit for logs to be written
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadLogs();
      console.log('[WebhookManager] Logs reloaded');
      toast({
        title: 'Test Sent',
        description: 'Test webhook has been sent',
      });
    } catch (error: any) {
      console.error('[WebhookManager] Error in handleTest:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send test webhook',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(secret);
    setTimeout(() => setCopiedSecret(null), 2000);
    toast({
      title: 'Copied',
      description: 'Secret copied to clipboard',
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      events: [],
      secret: '',
      enabled: true,
    });
  };

  const openEditDialog = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret: '', // Don't show existing secret
      enabled: webhook.enabled,
    });
    setShowCreateDialog(true);
  };

  const toggleEvent = (event: WebhookEventType) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-500" />;
      case 'retrying':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Always render UI, even if workspace is not loaded yet
  if (!workspace) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Webhooks</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Loading workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Webhooks</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure webhooks to receive notifications when workspace events occur
          </p>
        </div>
        <Button onClick={() => {
          resetForm();
          setEditingWebhook(null);
          setShowCreateDialog(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Webhook
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'webhooks'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Webhooks ({webhooks.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Delivery Logs ({logs.length})
        </button>
      </div>

      {/* Webhooks List */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          {webhooks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No webhooks configured</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    resetForm();
                    setEditingWebhook(null);
                    setShowCreateDialog(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Webhook
                </Button>
              </CardContent>
            </Card>
          ) : (
            webhooks.map(webhook => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{webhook.name}</CardTitle>
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            webhook.enabled
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {webhook.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <ExternalLink className="h-3 w-3" />
                        {webhook.url}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleEnabled(webhook)}
                      >
                        {webhook.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(webhook)}
                        disabled={loading}
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(webhook)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Events</p>
                      <div className="flex flex-wrap gap-2">
                        {webhook.events.map(event => {
                          const eventLabel = WEBHOOK_EVENTS.find(e => e.value === event)?.label || event;
                          return (
                            <span
                              key={event}
                              className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded"
                            >
                              {eventLabel}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Secret</p>
                      <div className="flex items-center gap-2">
                        <Input
                          type="password"
                          value={webhook.secret}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copySecret(webhook.secret)}
                        >
                          {copiedSecret === webhook.secret ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Logs List */}
      {activeTab === 'logs' && (
        <div className="space-y-2">
          {logs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No delivery logs yet</p>
              </CardContent>
            </Card>
          ) : (
            logs.map(log => {
              const webhook = webhooks.find(w => w.id === log.webhookId);
              return (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className="font-medium">{log.eventType}</span>
                          {webhook && (
                            <span className="text-sm text-muted-foreground">
                              • {webhook.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                          {log.responseStatus && (
                            <span>Status: {log.responseStatus}</span>
                          )}
                          {log.attempt > 1 && (
                            <span>Attempt: {log.attempt}</span>
                          )}
                          <span>{log.durationMs}ms</span>
                        </div>
                        {log.errorMessage && (
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {log.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWebhook ? 'Edit Webhook' : 'Create Webhook'}
            </DialogTitle>
            <DialogDescription>
              Configure a webhook to receive notifications about workspace events
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Webhook"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">URL</label>
              <Input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com/webhook"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Events</label>
              <div className="mt-2 space-y-2 border rounded-md p-4">
                {WEBHOOK_EVENTS.map(event => (
                  <label key={event.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.events.includes(event.value)}
                      onChange={() => toggleEvent(event.value)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{event.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Secret</label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="password"
                  value={formData.secret}
                  onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                  placeholder="Auto-generated if left empty"
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, secret: generateWebhookSecret() }))}
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Used to sign webhook payloads for verification
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="enabled" className="text-sm font-medium cursor-pointer">
                Enable webhook
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
                setEditingWebhook(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={editingWebhook ? handleUpdate : handleCreate} disabled={loading}>
              {editingWebhook ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
