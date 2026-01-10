## Release v<!-- version number -->

### Summary

<!-- Brief summary of what's in this release -->

### Changes

<!-- Auto-generated or manual list of changes -->

#### Features
- 

#### Bug Fixes
- 

#### Documentation
- 

#### Other
- 

### Breaking Changes

<!-- List any breaking changes -->

- [ ] No breaking changes
- [ ] Breaking changes (describe below):

### Release Checklist

- [ ] Version bumped in `packages/bdsg/package.json`
- [ ] CHANGELOG updated (if applicable)
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Examples updated (if needed)
- [ ] Ready to create tag and publish

### Post-Merge Steps

After merging this PR:

```bash
git checkout main
git pull
git tag v<!-- version number -->
git push origin v<!-- version number -->
```

This will trigger the automated release workflow.
