const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Get all settings for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { key } = req.query;

    if (key) {
      // Get single setting
      const setting = await prisma.setting.findUnique({
        where: {
          companyId_key: {
            companyId,
            key
          }
        }
      });

      if (!setting) {
        return res.status(404).json({ error: 'Setting not found' });
      }

      return res.json({ setting });
    }

    // Get all settings
    const settings = await prisma.setting.findMany({
      where: { companyId },
      orderBy: { key: 'asc' }
    });

    // Convert to key-value object
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    res.json({ settings: settingsObject });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Create or update setting
router.post('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value required' });
    }

    const setting = await prisma.setting.upsert({
      where: {
        companyId_key: {
          companyId,
          key
        }
      },
      update: {
        value: value.toString()
      },
      create: {
        companyId,
        key,
        value: value.toString()
      }
    });

    res.json({
      message: 'Setting saved successfully',
      setting
    });
  } catch (error) {
    console.error('Save setting error:', error);
    res.status(500).json({ error: 'Failed to save setting' });
  }
});

// Update setting
router.put('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value required' });
    }

    const setting = await prisma.setting.update({
      where: {
        companyId_key: {
          companyId,
          key
        }
      },
      data: {
        value: value.toString()
      }
    });

    res.json({
      message: 'Setting updated successfully',
      setting
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Delete setting
router.delete('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Key required' });
    }

    await prisma.setting.delete({
      where: {
        companyId_key: {
          companyId,
          key
        }
      }
    });

    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

// Bulk update settings
router.put('/:companyId/bulk', async (req, res) => {
  try {
    const { companyId } = req.params;
    const settings = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object required' });
    }

    const updates = Object.entries(settings).map(([key, value]) => ({
      companyId,
      key,
      value: value.toString()
    }));

    // Use transaction for bulk update
    await prisma.$transaction(async (tx) => {
      for (const update of updates) {
        await tx.setting.upsert({
          where: {
            companyId_key: {
              companyId: update.companyId,
              key: update.key
            }
          },
          update: {
            value: update.value
          },
          create: update
        });
      }
    });

    res.json({
      message: 'Settings updated successfully',
      updatedCount: updates.length
    });
  } catch (error) {
    console.error('Bulk update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router; 