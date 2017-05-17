package org.hisp.dhis.dxf2.metadata.objectbundle.hooks;

/*
 * Copyright (c) 2004-2017, University of Oslo
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * Neither the name of the HISP project nor the names of its contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import com.google.common.collect.Sets;
import org.hisp.dhis.common.IdentifiableObject;
import org.hisp.dhis.dxf2.metadata.objectbundle.ObjectBundle;
import org.hisp.dhis.program.notification.ProgramNotificationRecipient;
import org.hisp.dhis.program.notification.ProgramNotificationTemplate;

/**
 * @author Halvdan Hoem Grelland
 */
public class ProgramNotificationTemplateObjectBundleHook
    extends AbstractObjectBundleHook
{
    @Override
    public <T extends IdentifiableObject> void preCreate( T object, ObjectBundle bundle )
    {
        if ( !ProgramNotificationTemplate.class.isInstance( object ) ) return;
        ProgramNotificationTemplate template = (ProgramNotificationTemplate) object;

        preProcess( template );
    }

    @Override
    public <T extends IdentifiableObject> void preUpdate( T object, T persistedObject, ObjectBundle bundle )
    {
        if ( !ProgramNotificationTemplate.class.isInstance( object ) ) return;
        ProgramNotificationTemplate template = (ProgramNotificationTemplate) object;

        preProcess( template );
    }

    /**
     * Removes any non-valid combinations of properties on the template object.
     */
    private void preProcess( ProgramNotificationTemplate template )
    {
        if ( template.getNotificationTrigger().isImmediate() )
        {
            template.setRelativeScheduledDays( null );
        }

        if ( ProgramNotificationRecipient.USER_GROUP != template.getNotificationRecipient() )
        {
            template.setRecipientUserGroup( null );
        }

        if ( ! ( template.getNotificationRecipient().isExternalRecipient() ) )
        {
            template.setDeliveryChannels( Sets.newHashSet() );
        }
    }
}
