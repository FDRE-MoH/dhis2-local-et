package org.hisp.dhis.legend;

/*
 * Copyright (c) 2004-2016, University of Oslo
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

import org.hisp.dhis.DhisSpringTest;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.Assert.*;

/**
 * @author Lars Helge Overland
 */
public class LegendServiceTest
    extends DhisSpringTest
{
    @Autowired
    private LegendService legendService;

    private Legend legendA;
    private Legend legendB;
    
    private LegendSet legendSetA;
    
    @Test
    public void testAddGetLegend()
    {
        legendA = createLegend( 'A', 0d, 10d );
        legendB = createLegend( 'B', 0d, 10d );
        
        int idA = legendService.addLegend( legendA );
        int idB = legendService.addLegend( legendB );
        
        assertEquals( legendA, legendService.getLegend( idA ) );
        assertEquals( legendB, legendService.getLegend( idB ) );
    }
    
    @Test
    public void testDeleteLegend()
    {
        legendA = createLegend( 'A', 0d, 10d );

        int idA = legendService.addLegend( legendA );

        legendService.deleteLegend( legendA );

        assertNull( legendService.getLegend( idA ) );
    }
    
    @Test
    public void testAddGetLegendSet()
    {
        legendA = createLegend( 'A', 0d, 10d );
        legendB = createLegend( 'B', 0d, 10d );
        
        legendService.addLegend( legendA );
        legendService.addLegend( legendB );
        
        legendSetA = createLegendSet( 'A' );
        legendSetA.getLegends().add( legendA );
        legendSetA.getLegends().add( legendB );
        
        int idA = legendService.addLegendSet( legendSetA );
        
        assertEquals( legendSetA, legendService.getLegendSet( idA ) );
        assertEquals( 2, legendService.getLegendSet( idA ).getLegends().size() );
    }
    
    @Test
    public void testDeleteLegendSet()
    {
        legendA = createLegend( 'A', 0d, 10d );
        legendB = createLegend( 'B', 0d, 10d );

        legendService.addLegend( legendA );
        legendService.addLegend( legendB );

        legendSetA = createLegendSet( 'A' );
        legendSetA.getLegends().add( legendA );
        legendSetA.getLegends().add( legendB );

        int idA = legendService.addLegendSet( legendSetA );

        legendService.deleteLegendSet( legendSetA );

        assertNull( legendService.getLegendSet( idA ) );
    }   
}
